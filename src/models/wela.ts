export const genderValues = ["woman", "man", "non-binary"] as const;
export type Gender = (typeof genderValues)[number];

export function normaliseGender(value: unknown): Gender | undefined {
  return typeof value === "string" && genderValues.some((gender) => gender === value)
    ? value as Gender
    : undefined;
}
export type AgeRange = "18–29" | "30–39" | "40–49" | "50+";
export type SkinType = "balanced" | "dry" | "oily" | "combination" | "unsure";
export type SkinConcern =
  | "visible-breakouts"
  | "sensitivity"
  | "uneven-looking-tone"
  | "dark-circles"
  | "none"
  | "dark-spots"
  | "wrinkles"
  | "large-pores"
  | "dullness"
  | "melasma-freckles"
  | "dry-flaking";
export type SkincareGoal =
  | "calmer-looking-skin"
  | "comfortable-hydration"
  | "more-even-looking-tone"
  | "simpler-routine";

export interface UserAnswers {
  gender?: Gender;
  ageRange?: AgeRange;
  skinType?: SkinType;
  concerns: SkinConcern[];
  goals: SkincareGoal[];
}

export interface UploadedPhoto {
  file: File;
  previewUrl: string;
  source: "camera" | "library";
}

export interface Detection {
  className: "acne_lesion";
  confidence: number;
  region: keyof RegionCounts;
}

export interface RegionCounts {
  forehead: number;
  leftCheek: number;
  rightCheek: number;
  chin: number;
  nose: number;
}

export interface AnalysisResult {
  source: "api" | "mock";
  provenance?: {
    requestId: string;
    inputSha256Prefix: string;
    inferenceExecuted: boolean;
    rawDetectionCount: number;
    postThresholdDetectionCount: number;
  };
  lesionCount: number;
  dominantRegion: keyof RegionCounts | "none";
  confidenceSummary: "Low" | "Moderate" | "High";
  severityLevel: "Low" | "Moderate" | "Elevated";
  skinScore: number;
  detections: Detection[];
  regionCounts: RegionCounts;
  insights: string[];
  questionnaireInsights: string[];
  recommendations: string[];
  productRecommendations: AnalysisProductRecommendation[];
  disclaimer: string;
}

export interface AnalysisProductRecommendation {
  category: string;
  focus: string;
  rationale: string;
}

export type AnalysisErrorCode =
  | "invalid-image"
  | "network"
  | "timeout"
  | "validation"
  | "server"
  | "invalid-response"
  | "configuration"
  | "cancelled";

export interface AnalysisErrorState {
  code: AnalysisErrorCode;
  title: string;
  message: string;
  canRetry: boolean;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  category: string;
  role: string;
  usage: string;
  price: number;
  priority: "Essential" | "Optional";
  tone: "ivory" | "blush" | "burgundy";
}
