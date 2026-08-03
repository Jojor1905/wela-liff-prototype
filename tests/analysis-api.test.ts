import assert from "node:assert/strict";
import test from "node:test";
import { AnalysisApiError, createAnalysisApiClient } from "../src/services/analysis-api";
import type { UploadedPhoto, UserAnswers } from "../src/models/wela";

const answers: UserAnswers = {
  gender: "prefer-not-to-say",
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
  let submittedBody: FormData | undefined;
  const fetchMock = (async (_input: string | URL | Request, init?: RequestInit) => {
    submittedBody = init?.body as FormData;
    return new Response(JSON.stringify(apiResponse), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  const result = await client.predict({ answers, photo });

  assert.equal(submittedBody?.get("gender"), "prefer-not-to-say");
  assert.equal(submittedBody?.get("ageRange"), "30–39");
  assert.equal(submittedBody?.get("skinType"), "combination");
  assert.equal(submittedBody?.get("concerns"), "visible-breakouts,dark-circles");
  assert.equal(submittedBody?.get("goal"), "calmer-looking-skin");
  assert.ok(submittedBody?.get("image") instanceof File);
  assert.equal(result.source, "api");
  assert.equal(result.lesionCount, 3);
  assert.equal(result.dominantRegion, "rightCheek");
  assert.equal(result.severityLevel, "Moderate");
  assert.equal(result.skinScore, 78);
  assert.equal(result.productRecommendations[0].focus, "gentle lightweight cleanser");
  assert.match(result.questionnaireInsights[1], /dark circles/);
});

test("surfaces a real API error without returning mock analysis", async () => {
  const fetchMock = (async () => new Response(JSON.stringify({ detail: "Local model inference failed." }), { status: 500 })) as typeof fetch;
  const client = createAnalysisApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.predict({ answers, photo }),
    (error: unknown) => error instanceof AnalysisApiError && error.code === "server" && !error.message.includes("inference"),
  );
});

test("preserves the backend's no-dominant-region state when no lesions are marked", async () => {
  const emptyResponse = {
    ...apiResponse,
    total_detection_count: 0,
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
