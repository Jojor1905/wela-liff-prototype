import {
  normaliseGender,
  type AnalysisErrorCode,
  type AnalysisPhase,
  type AnalysisProductRecommendation,
  type AnalysisResult,
  type Detection,
  type RegionCounts,
  type UploadedPhoto,
  type UserAnswers,
} from "../models/wela";
import { analysisInputIsValid, auditAnalysisInput } from "../lib/analysis-validation";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const UNANSWERED_QUESTIONNAIRE_VALUE = "not_provided";
export const DEFAULT_PREDICTION_TIMEOUT_MS = 180_000;
const DEFAULT_READINESS_TIMEOUT_MS = 60_000;
const DEFAULT_READINESS_RETRY_DELAYS_MS = [1_500, 3_000] as const;

export interface AnalysisRequest {
  photo: UploadedPhoto;
  answers: UserAnswers;
  questionnaireRequired?: boolean;
  signal?: AbortSignal;
  requestId?: string;
  onPhase?: (phase: AnalysisPhase) => void;
}

export interface AnalysisApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface ReadinessOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  requestId?: string;
  timeoutMs?: number;
  retryDelaysMs?: readonly number[];
  sleepImpl?: (durationMs: number, signal?: AbortSignal) => Promise<void>;
  onPreparing?: () => void;
}

interface ApiBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ApiDetection {
  class_name: string;
  confidence: number;
  box: ApiBoundingBox;
  normalized_box: ApiBoundingBox;
  approximate_region: string;
}

interface ApiRegionCounts {
  forehead: number;
  left_cheek: number;
  right_cheek: number;
  nose: number;
  chin: number;
}

export interface PredictApiResponse {
  request_id: string;
  input_sha256_prefix: string;
  inference_executed: boolean;
  raw_detection_count: number;
  post_threshold_detection_count: number;
  image_width: number;
  image_height: number;
  total_detection_count: number;
  mean_detection_confidence: number;
  detections: ApiDetection[];
  approximate_face_region_counts: ApiRegionCounts;
  dominant_region: string;
  prototype_breakout_level: string;
  prototype_skin_score: number;
  insights: string[];
  product_recommendations: AnalysisProductRecommendation[];
  disclaimer?: string;
}

export class AnalysisApiError extends Error {
  constructor(
    public readonly code: AnalysisErrorCode,
    message: string,
    public readonly status?: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "AnalysisApiError";
  }
}

function requestReference(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `wela-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function endpointFor(baseUrl: string, path: string): URL {
  try {
    const endpoint = new URL(path, `${baseUrl.replace(/\/+$/, "")}/`);
    if (!new Set(["http:", "https:"]).has(endpoint.protocol)) throw new Error("Unsupported protocol");
    return endpoint;
  } catch {
    throw new AnalysisApiError("configuration", "The analysis service URL is not configured correctly.");
  }
}

function sleep(durationMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AnalysisApiError("cancelled", "The analysis request was cancelled."));
      return;
    }
    const finish = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const timer = setTimeout(finish, durationMs);
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(new AnalysisApiError("cancelled", "The analysis request was cancelled."));
    };
    signal?.addEventListener("abort", abort, { once: true });
  });
}

async function fetchWithTimeout({
  fetchImpl,
  input,
  init,
  timeoutMs,
  signal,
}: {
  fetchImpl: typeof fetch;
  input: URL;
  init: RequestInit;
  timeoutMs: number;
  signal?: AbortSignal;
}): Promise<{ response: Response; timedOut: false }> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort("timeout");
  }, timeoutMs);
  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetchImpl(input, { ...init, signal: controller.signal });
    return { response, timedOut: false };
  } catch (error) {
    if (signal?.aborted) throw new AnalysisApiError("cancelled", "The analysis request was cancelled.");
    if (timedOut) throw new AnalysisApiError("timeout", "The analysis service took too long to respond.");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export async function waitForAnalysisReady({
  baseUrl,
  fetchImpl = fetch,
  signal,
  requestId = requestReference(),
  timeoutMs = DEFAULT_READINESS_TIMEOUT_MS,
  retryDelaysMs = DEFAULT_READINESS_RETRY_DELAYS_MS,
  sleepImpl = sleep,
  onPreparing,
}: ReadinessOptions): Promise<string> {
  const endpoint = endpointFor(baseUrl, "health");
  let lastError: AnalysisApiError | null = null;

  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
    try {
      const { response } = await fetchWithTimeout({
        fetchImpl,
        input: endpoint,
        init: { cache: "no-store" },
        timeoutMs,
        signal,
      });
      const responseRequestId = response.headers.get("x-request-id") ?? requestId;
      if (response.status === 503) {
        lastError = new AnalysisApiError("model-not-ready", "The analysis model is not ready.", 503, responseRequestId);
      } else if (!response.ok) {
        throw new AnalysisApiError("network", "The analysis service health check failed.", response.status, responseRequestId);
      } else {
        const payload = await response.json() as { status?: unknown; model_loaded?: unknown };
        if (payload.status === "ok" && payload.model_loaded === true) return responseRequestId;
        lastError = new AnalysisApiError("model-not-ready", "The analysis model is not ready.", response.status, responseRequestId);
      }
    } catch (error) {
      if (error instanceof AnalysisApiError && error.code === "cancelled") throw error;
      if (error instanceof AnalysisApiError && error.code === "timeout") {
        lastError = new AnalysisApiError("waking", "The analysis service is still waking up.", undefined, requestId);
      } else if (error instanceof AnalysisApiError) {
        lastError = error;
      } else {
        lastError = new AnalysisApiError("network", "Wela could not reach the analysis service.", undefined, requestId);
      }
    }

    if (attempt < retryDelaysMs.length) {
      onPreparing?.();
      await sleepImpl(retryDelaysMs[attempt], signal);
    }
  }

  throw lastError ?? new AnalysisApiError("network", "Wela could not reach the analysis service.", undefined, requestId);
}

export function validateImageFile(file: File): void {
  if (!file.size) {
    throw new AnalysisApiError("invalid-image", "The selected image is empty. Please choose another JPEG, PNG, or WEBP image.");
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    throw new AnalysisApiError("invalid-image", "This image format is not supported. Please choose a JPEG, PNG, or WEBP image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new AnalysisApiError("invalid-image", "This image is larger than 10 MB. Please choose a smaller image.");
  }
}

function toRegion(value: string): keyof RegionCounts | "none" | null {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const regions: Record<string, keyof RegionCounts | "none"> = {
    forehead: "forehead",
    left_cheek: "leftCheek",
    right_cheek: "rightCheek",
    nose: "nose",
    chin: "chin",
    none: "none",
    none_marked: "none",
  };
  return regions[normalized] ?? null;
}

function confidenceSummary(value: number): AnalysisResult["confidenceSummary"] {
  if (value >= 0.75) return "High";
  if (value >= 0.4) return "Moderate";
  return "Low";
}

function breakoutLevel(value: string): AnalysisResult["severityLevel"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("elevated") || normalized.includes("high")) return "Elevated";
  if (normalized.includes("moderate") || normalized.includes("medium")) return "Moderate";
  return "Low";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPredictResponse(value: unknown): value is PredictApiResponse {
  if (!isRecord(value) || !isRecord(value.approximate_face_region_counts)) return false;
  const regions = value.approximate_face_region_counts;
  const detections = value.detections;
  return (
    typeof value.request_id === "string" &&
    typeof value.input_sha256_prefix === "string" && /^[a-f0-9]{12}$/.test(value.input_sha256_prefix) &&
    value.inference_executed === true &&
    typeof value.raw_detection_count === "number" &&
    typeof value.post_threshold_detection_count === "number" &&
    typeof value.total_detection_count === "number" &&
    value.raw_detection_count >= value.post_threshold_detection_count &&
    value.post_threshold_detection_count === value.total_detection_count &&
    typeof value.mean_detection_confidence === "number" &&
    typeof value.dominant_region === "string" &&
    typeof value.prototype_breakout_level === "string" &&
    typeof value.prototype_skin_score === "number" &&
    Number.isFinite(value.prototype_skin_score) &&
    ["forehead", "left_cheek", "right_cheek", "nose", "chin"].every((key) => typeof regions[key] === "number") &&
    Array.isArray(detections) && value.total_detection_count === detections.length && detections.every((item) => isRecord(item) && typeof item.class_name === "string" && typeof item.confidence === "number" && typeof item.approximate_region === "string") &&
    Array.isArray(value.insights) && value.insights.every((item) => typeof item === "string") &&
    Array.isArray(value.product_recommendations) && value.product_recommendations.every((item) => isRecord(item) && typeof item.category === "string" && typeof item.focus === "string" && typeof item.rationale === "string")
  );
}

function questionnaireInsights(answers: UserAnswers): string[] {
  const skinTypeLabels: Partial<Record<NonNullable<UserAnswers["skinType"]>, string>> = {
    balanced: "ผิวธรรมดา",
    dry: "ผิวแห้ง",
    oily: "ผิวมัน",
    combination: "ผิวผสม",
    sensitive: "ผิวแพ้ง่าย",
  };
  const concernLabels: Partial<Record<UserAnswers["concerns"][number], string>> = {
    "visible-breakouts": "สิวและรอยสิว",
    sensitivity: "การระคายเคือง",
    "uneven-looking-tone": "สีผิวไม่สม่ำเสมอ",
    "dark-circles": "รอยคล้ำใต้ตา",
    "dark-spots": "จุดด่างดำ",
    wrinkles: "ริ้วรอย",
    "large-pores": "รูขุมขนกว้าง",
    dullness: "ผิวหมองคล้ำ",
    "melasma-freckles": "ฝ้าหรือกระ",
    "dry-flaking": "ผิวแห้งลอก",
  };
  const declaredConcerns = answers.concerns.flatMap((concern) => {
    const label = concernLabels[concern];
    return label ? [label] : [];
  });
  return [
    answers.skinType
      ? `คุณระบุลักษณะผิวว่า ${skinTypeLabels[answers.skinType]} ข้อมูลนี้มาจากแบบสอบถามและไม่ได้อนุมานจากภาพ`
      : "คุณยังไม่ได้ระบุลักษณะผิว จึงไม่มีการสร้างเงื่อนไขลักษณะผิวแทนคำตอบของคุณ",
    declaredConcerns.length
      ? `ความกังวลที่คุณระบุ: ${declaredConcerns.join(" · ")} ข้อมูลเหล่านี้ไม่ใช่สิ่งที่โมเดลตรวจพบ`
      : "คุณยังไม่ได้ระบุความกังวลด้านผิว จึงไม่มีการสร้างคำตอบแทนคุณ",
  ];
}

export function mapPredictResponse(response: PredictApiResponse, answers: UserAnswers): AnalysisResult {
  const regionCounts: RegionCounts = {
    forehead: response.approximate_face_region_counts.forehead ?? 0,
    leftCheek: response.approximate_face_region_counts.left_cheek ?? 0,
    rightCheek: response.approximate_face_region_counts.right_cheek ?? 0,
    nose: response.approximate_face_region_counts.nose ?? 0,
    chin: response.approximate_face_region_counts.chin ?? 0,
  };
  const fallbackDominant = (Object.entries(regionCounts) as [keyof RegionCounts, number][])
    .reduce((highest, current) => current[1] > highest[1] ? current : highest, ["forehead", 0] as [keyof RegionCounts, number])[0];
  const detections: Detection[] = response.detections
    .filter((item) => item.class_name === "acne_lesion")
    .map((item) => {
      const mappedRegion = toRegion(item.approximate_region);
      return {
        className: "acne_lesion",
        confidence: item.confidence,
        region: mappedRegion && mappedRegion !== "none" ? mappedRegion : fallbackDominant,
      };
    });
  return {
    source: "api",
    provenance: {
      requestId: response.request_id,
      inputSha256Prefix: response.input_sha256_prefix,
      inferenceExecuted: response.inference_executed,
      rawDetectionCount: response.raw_detection_count,
      postThresholdDetectionCount: response.post_threshold_detection_count,
    },
    lesionCount: response.total_detection_count,
    dominantRegion: toRegion(response.dominant_region) ?? fallbackDominant,
    confidenceSummary: confidenceSummary(response.mean_detection_confidence),
    severityLevel: breakoutLevel(response.prototype_breakout_level),
    skinScore: Math.max(0, Math.min(100, Math.round(response.prototype_skin_score))),
    detections,
    regionCounts,
    insights: response.insights.filter((insight): insight is string => typeof insight === "string"),
    questionnaireInsights: questionnaireInsights(answers),
    recommendations: response.product_recommendations.map((item) => item.focus),
    productRecommendations: response.product_recommendations,
    disclaimer: response.disclaimer ?? "Experimental visual analysis for prototype demonstration only. Results may be incomplete or inaccurate and are not a medical diagnosis.",
  };
}

function formDataFor(request: AnalysisRequest): FormData {
  const { answers, photo } = request;
  const gender = normaliseGender(answers.gender);
  validateImageFile(photo.file);
  const body = new FormData();
  body.append("image", photo.file);
  body.append("gender", gender ?? UNANSWERED_QUESTIONNAIRE_VALUE);
  // The running production handler currently requires these camelCase names.
  // Its generated OpenAPI document advertises snake_case, so integration tests
  // intentionally pin the observed request contract until the backend is aligned.
  body.append("ageRange", answers.ageRange ?? UNANSWERED_QUESTIONNAIRE_VALUE);
  body.append("skinType", answers.skinType ?? UNANSWERED_QUESTIONNAIRE_VALUE);
  body.append("concerns", answers.concerns.join(","));
  body.append("goal", answers.goals.join(",") || UNANSWERED_QUESTIONNAIRE_VALUE);
  return body;
}

function messageForStatus(status: number, requestId: string): AnalysisApiError {
  if ([400, 413, 415].includes(status)) {
    return new AnalysisApiError("invalid-image", "The analysis service could not read this image. Please choose a clear JPEG, PNG, or WEBP image under 10 MB.", status, requestId);
  }
  if (status === 422) {
    return new AnalysisApiError("validation", "The analysis request was incomplete. Review your answers and try again.", status, requestId);
  }
  if (status === 503) return new AnalysisApiError("model-not-ready", "The analysis model is not ready.", status, requestId);
  if (status === 429) {
    return new AnalysisApiError("server", "The analysis service is busy. Please wait a moment and try again.", status, requestId);
  }
  return new AnalysisApiError("server", "The analysis service could not complete the prediction. Please try again.", status, requestId);
}

async function messageForResponse(response: Response, requestId: string): Promise<AnalysisApiError> {
  if (response.status !== 422) return messageForStatus(response.status, requestId);
  try {
    const payload = await response.json() as { detail?: Array<{ loc?: unknown[] }> };
    const missingFields = payload.detail?.flatMap((item) => {
      const field = item.loc?.at(-1);
      return typeof field === "string" ? [field] : [];
    }) ?? [];
    if (missingFields.includes("image")) {
      return new AnalysisApiError("missing-image", "The analysis request did not contain an image.", 422, requestId);
    }
  } catch {
    // Keep the stable validation classification when FastAPI sends an unreadable error body.
  }
  return messageForStatus(response.status, requestId);
}

export function createAnalysisApiClient({ baseUrl, fetchImpl = fetch, timeoutMs = DEFAULT_PREDICTION_TIMEOUT_MS }: AnalysisApiClientOptions) {
  const endpoint = endpointFor(baseUrl, "predict");

  return {
    async predict(request: AnalysisRequest): Promise<AnalysisResult> {
      const requestId = request.requestId ?? requestReference();
      const audit = auditAnalysisInput(request.answers, request.photo, {
        questionnaireRequired: request.questionnaireRequired ?? true,
      });
      if (!analysisInputIsValid(audit)) {
        if (!audit.hasSelectedFile) throw new AnalysisApiError("missing-image", "No selected image is available for analysis.");
        if (!audit.hasValidImageFile) throw new AnalysisApiError("invalid-image", "The selected image is empty or has an unsupported format.");
        throw new AnalysisApiError("validation", "The questionnaire is incomplete or contains an invalid answer.");
      }
      request.onPhase?.("uploading");
      let analysingTimer: ReturnType<typeof setTimeout> | undefined;
      try {
        analysingTimer = setTimeout(() => request.onPhase?.("analysing"), 1_000);
        const { response } = await fetchWithTimeout({
          fetchImpl,
          input: endpoint,
          init: {
            method: "POST",
            body: formDataFor(request),
            cache: "no-store",
            headers: { "X-Request-ID": requestId },
          },
          timeoutMs,
          signal: request.signal,
        });
        const responseRequestId = response.headers.get("x-request-id") ?? requestId;
        if (!response.ok) throw await messageForResponse(response, responseRequestId);
        request.onPhase?.("finalising");
        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          throw new AnalysisApiError("invalid-response", "The analysis service returned an unreadable response. Please try again.", response.status, responseRequestId);
        }
        if (!isPredictResponse(payload)) {
          throw new AnalysisApiError("invalid-response", "The analysis service returned an unexpected response. Please try again.", response.status, responseRequestId);
        }
        return mapPredictResponse(payload, request.answers);
      } catch (error) {
        if (error instanceof AnalysisApiError && error.code === "timeout") {
          throw new AnalysisApiError("timeout", "The analysis service took too long to respond. Please try again.", undefined, requestId);
        }
        if (error instanceof AnalysisApiError) throw error;
        throw new AnalysisApiError(
          "prediction-failed",
          "The connection ended while the image was being submitted or the prediction result was being returned.",
          undefined,
          requestId,
        );
      } finally {
        if (analysingTimer) clearTimeout(analysingTimer);
      }
    },
  };
}
