import type { AnalysisResult, UploadedPhoto, UserAnswers } from "../models/wela";
import { AnalysisApiError, createAnalysisApiClient } from "./analysis-api";
import { runMockAnalysis } from "./mock-analysis";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
const explicitlyMocked = process.env.NEXT_PUBLIC_USE_MOCK_ANALYSIS === "true";

export const analysisMode: "api" | "mock" = explicitlyMocked || !apiBaseUrl ? "mock" : "api";

export async function runAnalysis({ answers, photo, signal }: { answers: UserAnswers; photo: UploadedPhoto | null; signal?: AbortSignal }): Promise<AnalysisResult> {
  if (analysisMode === "mock") return runMockAnalysis(answers, signal);
  if (!photo) {
    throw new AnalysisApiError("invalid-image", "Choose a JPEG, PNG, or WEBP image before starting local analysis.");
  }
  return createAnalysisApiClient({ baseUrl: apiBaseUrl }).predict({ answers, photo, signal });
}
