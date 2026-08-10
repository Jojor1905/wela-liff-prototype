import assert from "node:assert/strict";
import test from "node:test";
import { AnalysisApiError, DEFAULT_PREDICTION_TIMEOUT_MS, createAnalysisApiClient, waitForAnalysisReady } from "../src/services/analysis-api";
import { normaliseGender, type UploadedPhoto, type UserAnswers } from "../src/models/wela";

const answers: UserAnswers = {
  gender: "woman",
  ageRange: "30–39",
  skinType: "combination",
  concerns: ["visible-breakouts", "dark-circles"],
  goals: ["calmer-looking-skin"],
};

const photo: UploadedPhoto = {
  file: new File([new Uint8Array([137, 80, 78, 71])], "portrait.png", { type: "image/png" }),
  previewUrl: "blob:test-preview",
  source: "library",
};

const apiResponse = {
  request_id: "request-current-image",
  input_sha256_prefix: "a1b2c3d4e5f6",
  inference_executed: true,
  raw_detection_count: 4,
  post_threshold_detection_count: 3,
  image_width: 390,
  image_height: 520,
  total_detection_count: 3,
  mean_detection_confidence: 0.72,
  detections: [
    {
      class_name: "acne_lesion",
      confidence: 0.72,
      box: { x1: 10, y1: 20, x2: 30, y2: 40 },
      normalized_box: { x1: 0.1, y1: 0.2, x2: 0.3, y2: 0.4 },
      approximate_region: "right_cheek",
    },
    {
      class_name: "acne_lesion",
      confidence: 0.7,
      box: { x1: 35, y1: 45, x2: 55, y2: 65 },
      normalized_box: { x1: 0.35, y1: 0.45, x2: 0.55, y2: 0.65 },
      approximate_region: "right_cheek",
    },
    {
      class_name: "acne_lesion",
      confidence: 0.74,
      box: { x1: 60, y1: 45, x2: 80, y2: 65 },
      normalized_box: { x1: 0.6, y1: 0.45, x2: 0.8, y2: 0.65 },
      approximate_region: "left_cheek",
    },
  ],
  approximate_face_region_counts: { forehead: 0, left_cheek: 1, right_cheek: 2, nose: 0, chin: 0 },
  dominant_region: "right_cheek",
  prototype_breakout_level: "moderate",
  prototype_skin_score: 78,
  insights: ["Three candidate acne_lesion regions were marked."],
  product_recommendations: [
    { category: "cleanser", focus: "gentle lightweight cleanser", rationale: "Selected from questionnaire context." },
  ],
  disclaimer: "Experimental visual analysis for prototype demonstration only. Results may be incomplete or inaccurate and are not a medical diagnosis.",
};

test("submits the expected multipart form and maps a successful API response", async () => {
  let submittedUrl = "";
  let submittedBody: FormData | undefined;
  let submittedInit: RequestInit | undefined;
  const fetchMock = (async (input: string | URL | Request, init?: RequestInit) => {
    submittedUrl = input.toString();
    submittedInit = init;
    submittedBody = init?.body as FormData;
    return new Response(JSON.stringify(apiResponse), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  const result = await client.predict({ answers, photo });

  assert.equal(submittedUrl, "http://127.0.0.1:8000/predict");
  assert.equal(submittedBody?.get("gender"), "woman");
  assert.equal(submittedBody?.get("ageRange"), "30–39");
  assert.equal(submittedBody?.get("skinType"), "combination");
  assert.equal(submittedBody?.get("concerns"), "visible-breakouts,dark-circles");
  assert.equal(submittedBody?.get("goal"), "calmer-looking-skin");
  assert.equal(submittedBody?.get("image"), photo.file);
  assert.equal(await (submittedBody?.get("image") as File).arrayBuffer().then((value) => Buffer.from(value).toString("hex")), "89504e47");
  assert.equal(submittedInit?.cache, "no-store");
  assert.equal(new Headers(submittedInit?.headers).has("content-type"), false);
  assert.equal(new Headers(submittedInit?.headers).has("x-request-id"), true);
  assert.equal(result.source, "api");
  assert.equal(result.provenance?.inputSha256Prefix, "a1b2c3d4e5f6");
  assert.equal(result.lesionCount, 3);
  assert.equal(result.dominantRegion, "rightCheek");
  assert.equal(result.severityLevel, "Moderate");
  assert.equal(result.skinScore, 78);
  assert.equal(result.productRecommendations[0].focus, "gentle lightweight cleanser");
  assert.match(result.questionnaireInsights[0], /ผิวผสม/);
  assert.match(result.questionnaireInsights[1], /รอยคล้ำใต้ตา/);
  assert.equal(result.questionnaireInsights.some((insight) => insight.includes("not_provided")), false);
});

test("immediate analysis submits the selected File exactly once without fabricated answers", async () => {
  let calls = 0;
  let submittedBody: FormData | undefined;
  const fetchMock = (async (_input: string | URL | Request, init?: RequestInit) => {
    calls += 1;
    submittedBody = init?.body as FormData;
    return new Response(JSON.stringify(apiResponse), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await client.predict({ answers: { concerns: [], goals: [] }, photo, questionnaireRequired: false });

  assert.equal(calls, 1);
  assert.equal(submittedBody?.get("image"), photo.file);
  assert.equal(submittedBody?.get("gender"), "not_provided");
  assert.equal(submittedBody?.get("ageRange"), "not_provided");
  assert.equal(submittedBody?.get("skinType"), "not_provided");
  assert.equal(submittedBody?.get("concerns"), "");
  assert.equal(submittedBody?.get("goal"), "not_provided");
});

test("missing questionnaire answers are represented as missing state without rendering protocol sentinels", async () => {
  const fetchMock = (async () => new Response(JSON.stringify(apiResponse), { status: 200 })) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  const result = await client.predict({ answers: { concerns: [], goals: [] }, photo, questionnaireRequired: false });

  assert.match(result.questionnaireInsights[0], /ยังไม่ได้ระบุลักษณะผิว/);
  assert.equal(result.questionnaireInsights.some((insight) => insight.includes("not_provided")), false);
});

test("replacing the selected File changes the multipart bytes sent to prediction", async () => {
  const submitted: File[] = [];
  const fetchMock = (async (_input: string | URL | Request, init?: RequestInit) => {
    submitted.push((init?.body as FormData).get("image") as File);
    return new Response(JSON.stringify(apiResponse), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });
  const replacement = new File([new Uint8Array([1, 2, 3, 4])], "replacement.png", { type: "image/png" });

  await client.predict({ answers, photo });
  await client.predict({ answers, photo: { ...photo, file: replacement } });

  assert.equal(submitted[0], photo.file);
  assert.equal(submitted[1], replacement);
  assert.notDeepEqual(Buffer.from(await submitted[0].arrayBuffer()), Buffer.from(await submitted[1].arrayBuffer()));
});

test("a complete current questionnaire reaches the real prediction request", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return new Response(JSON.stringify(apiResponse), { status: 200 });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await client.predict({ answers, photo, questionnaireRequired: true });

  assert.equal(calls, 1);
});

test("an incomplete required questionnaire never calls prediction", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return new Response(JSON.stringify(apiResponse), { status: 200 });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers: { ...answers, skinType: undefined }, photo, questionnaireRequired: true }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "validation",
  );
  assert.equal(calls, 0);
});

test("a missing image is classified separately and never calls prediction", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return new Response(JSON.stringify(apiResponse), { status: 200 });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers, photo: null as unknown as UploadedPhoto, questionnaireRequired: true }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "missing-image",
  );
  assert.equal(calls, 0);
});

test("a backend 422 that identifies the image remains a missing-image error", async () => {
  const fetchMock = (async () => new Response(JSON.stringify({
    detail: [{ type: "missing", loc: ["body", "image"], msg: "Field required", input: null }],
  }), { status: 422, headers: { "X-Request-ID": "missing-image-reference" } })) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers, photo, questionnaireRequired: true }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "missing-image" && error.requestId === "missing-image-reference",
  );
});

test("maps the latest API response instead of retaining a previous result", async () => {
  let call = 0;
  const fetchMock = (async () => {
    call += 1;
    const payload = call === 1
      ? apiResponse
      : { ...apiResponse, request_id: "request-new-image", input_sha256_prefix: "ffeeddccbbaa", raw_detection_count: 2, post_threshold_detection_count: 1, total_detection_count: 1, detections: apiResponse.detections.slice(0, 1), prototype_skin_score: 93 };
    return new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  const first = await client.predict({ answers, photo });
  const latest = await client.predict({ answers, photo });

  assert.equal(first.lesionCount, 3);
  assert.equal(latest.lesionCount, 1);
  assert.equal(latest.skinScore, 93);
  assert.equal(latest.provenance?.inputSha256Prefix, "ffeeddccbbaa");
});

test("clears removed legacy gender values instead of mapping them to another option", () => {
  assert.equal(normaliseGender("prefer-not-to-say"), undefined);
  assert.equal(normaliseGender("prefer_not_to_say"), undefined);
  assert.equal(normaliseGender("unspecified"), undefined);
});

test("surfaces a real API error without returning mock analysis", async () => {
  const fetchMock = (async () => new Response(JSON.stringify({ detail: "Local model inference failed." }), { status: 500 })) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers, photo }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "server" && !error.message.includes("inference"),
  );
});

test("a prediction connection failure is distinct and never becomes a mock success", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    throw new TypeError("connection refused");
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers, photo }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "prediction-failed",
  );
  assert.equal(calls, 1);
});

test("a manual retry starts one new prediction only after the failed request has settled", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    if (calls === 1) throw new TypeError("render gateway reset");
    return new Response(JSON.stringify(apiResponse), { status: 200 });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "https://wela-skin-ai-api.onrender.com/", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers, photo, requestId: "first-attempt" }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "prediction-failed",
  );
  assert.equal(calls, 1);

  const result = await client.predict({ answers, photo, requestId: "retry-attempt" });

  assert.equal(calls, 2);
  assert.equal(result.source, "api");
});

test("the production prediction timeout is long enough for measured Render inference", () => {
  assert.equal(DEFAULT_PREDICTION_TIMEOUT_MS, 180_000);
});

test("a genuine prediction timeout aborts the request and maps only to timeout", async () => {
  let aborted = false;
  const fetchMock = (async (_input: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
      aborted = true;
      reject(new DOMException("timed out", "AbortError"));
    }, { once: true });
  })) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock, timeoutMs: 5 });

  await assert.rejects(
    client.predict({ answers, photo, requestId: "timeout-reference" }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "timeout" && error.requestId === "timeout-reference",
  );
  assert.equal(aborted, true);
});

test("an external AbortError remains cancellation rather than timeout", async () => {
  const controller = new AbortController();
  const fetchMock = (async (_input: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("cancelled", "AbortError")), { once: true });
  })) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock, timeoutMs: 1_000 });
  const prediction = client.predict({ answers, photo, signal: controller.signal });
  controller.abort("user left loading screen");

  await assert.rejects(prediction, (error: unknown) => error instanceof AnalysisApiError && error.code === "cancelled");
});

test("a successful response is not replaced by a stale timeout callback", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return new Response(JSON.stringify(apiResponse), { status: 200 });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock, timeoutMs: 5 });

  const result = await client.predict({ answers, photo });
  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.equal(result.provenance?.requestId, apiResponse.request_id);
  assert.equal(calls, 1);
});

test("503 model readiness has a distinct error and POST is never retried", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ detail: { code: "model_not_ready" } }), { status: 503, headers: { "X-Request-ID": "backend-reference" } });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers, photo }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "model-not-ready" && error.requestId === "backend-reference",
  );
  assert.equal(calls, 1);
});

test("health readiness retries bounded model warm-up without submitting prediction", async () => {
  let healthCalls = 0;
  let preparingCalls = 0;
  const fetchMock = (async () => {
    healthCalls += 1;
    return healthCalls === 1
      ? new Response(JSON.stringify({ status: "unavailable", model_loaded: false }), { status: 503 })
      : new Response(JSON.stringify({ status: "ok", model_loaded: true }), { status: 200, headers: { "X-Request-ID": "ready-reference" } });
  }) as typeof fetch;

  const requestId = await waitForAnalysisReady({
    baseUrl: "http://127.0.0.1:8000",
    fetchImpl: fetchMock,
    requestId: "frontend-reference",
    retryDelaysMs: [1],
    sleepImpl: async () => undefined,
    onPreparing: () => { preparingCalls += 1; },
  });

  assert.equal(requestId, "ready-reference");
  assert.equal(healthCalls, 2);
  assert.equal(preparingCalls, 1);
});

test("preserves the backend's no-dominant-region state when no lesions are marked", async () => {
  const emptyResponse = {
    ...apiResponse,
    total_detection_count: 0,
    raw_detection_count: 2,
    post_threshold_detection_count: 0,
    mean_detection_confidence: 0,
    detections: [],
    approximate_face_region_counts: { forehead: 0, left_cheek: 0, right_cheek: 0, nose: 0, chin: 0 },
    dominant_region: "none",
    prototype_breakout_level: "none_marked",
    prototype_skin_score: 100,
  };
  const fetchMock = (async () => new Response(JSON.stringify(emptyResponse), { status: 200 })) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  const result = await client.predict({ answers, photo });

  assert.equal(result.dominantRegion, "none");
  assert.equal(result.lesionCount, 0);
});

test("rejects unsupported images before making an API request", async () => {
  let called = false;
  const fetchMock = (async () => { called = true; return new Response(); }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });
  const unsupportedPhoto: UploadedPhoto = {
    ...photo,
    file: new File(["heic"], "portrait.heic", { type: "image/heic" }),
  };

  await assert.rejects(client.predict({ answers, photo: unsupportedPhoto }), (error: unknown) => error instanceof AnalysisApiError && error.code === "invalid-image");
  assert.equal(called, false);
});
