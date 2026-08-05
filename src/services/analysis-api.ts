import {
  normaliseGender,
  type AnalysisErrorCode,
  type AnalysisProductRecommendation,
  type AnalysisResult,
  type Detection,
  type RegionCounts,
  type UploadedPhoto,
  type UserAnswers,
} from "../models/wela";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface AnalysisRequest {
  photo: UploadedPhoto;
  answers: UserAnswers;
  signal?: AbortSignal;
}

export interface AnalysisApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
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
  ) {
    super(message);
    this.name = "AnalysisApiError";
  }
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
  const skinType = answers.skinType ? answers.skinType.replaceAll("-", " ") : "selected";
  const declaredConcerns = answers.concerns
    .filter((concern) => concern !== "none")
    .map((concern) => concern.replaceAll("-", " "));
  return [
    `Your ${skinType} skin description and selected goals guide the product categories; they are not inferred from the image.`,
    declaredConcerns.length
      ? `You declared ${declaredConcerns.join(", ")} as questionnaire concerns. These are not model detections.`
      : "You did not declare a specific cosmetic concern in the questionnaire.",
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
  if (!gender || !answers.ageRange || !answers.skinType || !answers.goals.length) {
    throw new AnalysisApiError("validation", "Please complete the consultation questions before submitting your image.");
  }
  validateImageFile(photo.file);
  const body = new FormData();
  body.append("image", photo.file);
  body.append("gender", gender);
  body.append("ageRange", answers.ageRange);
  body.append("skinType", answers.skinType);
  body.append("concerns", answers.concerns.join(","));
  body.append("goal", answers.goals.join(","));
  return body;
}

function messageForStatus(status: number): AnalysisApiError {
  if ([400, 413, 415].includes(status)) {
    return new AnalysisApiError("invalid-image", "The local analysis service could not read this image. Please choose a clear JPEG, PNG, or WEBP image under 10 MB.", status);
  }
  if (status === 422) {
    return new AnalysisApiError("validation", "The analysis request was incomplete. Review your answers and try again.", status);
  }
  if (status === 429) {
    return new AnalysisApiError("server", "The local analysis service is busy. Please wait a moment and try again.", status);
  }
  return new AnalysisApiError("server", "The local analysis service could not complete the request. Please try again.", status);
}

export function createAnalysisApiClient({ baseUrl, fetchImpl = fetch, timeoutMs = 45_000 }: AnalysisApiClientOptions) {
  let endpoint: URL;
  try {
    endpoint = new URL("predict", `${baseUrl.replace(/\/+$/, "")}/`);
    if (!new Set(["http:", "https:"]).has(endpoint.protocol)) throw new Error("Unsupported protocol");
  } catch {
    throw new AnalysisApiError("configuration", "The analysis service URL is not configured correctly.");
  }

  return {
    async predict(request: AnalysisRequest): Promise<AnalysisResult> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("timeout"), timeoutMs);
      const abort = () => controller.abort(request.signal?.reason);
      request.signal?.addEventListener("abort", abort, { once: true });
      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          body: formDataFor(request),
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw messageForStatus(response.status);
        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          throw new AnalysisApiError("invalid-response", "The local analysis service returned an unreadable response. Please try again.");
        }
        if (!isPredictResponse(payload)) {
          throw new AnalysisApiError("invalid-response", "The local analysis service returned an unexpected response. Please try again.");
        }
        return mapPredictResponse(payload, request.answers);
      } catch (error) {
        if (error instanceof AnalysisApiError) throw error;
        if (controller.signal.aborted) {
          if (request.signal?.aborted) throw new AnalysisApiError("cancelled", "The analysis request was cancelled.");
          throw new AnalysisApiError("timeout", "The local analysis service took too long to respond. Please try again.");
        }
        throw new AnalysisApiError("network", "Wela could not reach the local analysis service. Check that it is running, then try again.");
      } finally {
        clearTimeout(timeout);
        request.signal?.removeEventListener("abort", abort);
      }
    },
  };
}
