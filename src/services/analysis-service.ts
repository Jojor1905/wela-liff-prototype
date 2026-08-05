import type { AnalysisResult, UploadedPhoto, UserAnswers } from "../models/wela";
import { AnalysisApiError, createAnalysisApiClient } from "./analysis-api";
import { resolveAnalysisMode } from "./analysis-config";
import { runMockAnalysis } from "./mock-analysis";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export const analysisMode = resolveAnalysisMode(process.env.NEXT_PUBLIC_USE_MOCK_ANALYSIS);

export async function runAnalysis({ answers, photo, signal }: { answers: UserAnswers; photo: UploadedPhoto | null; signal?: AbortSignal }): Promise<AnalysisResult> {
  if (analysisMode === "mock") return runMockAnalysis(answers, signal);
  if (!apiBaseUrl) {
    throw new AnalysisApiError("configuration", "Set NEXT_PUBLIC_API_BASE_URL before using real analysis mode.");
  }
  if (!photo) {
    throw new AnalysisApiError("invalid-image", "Choose a JPEG, PNG, or WEBP image before starting local analysis.");
  }
  return createAnalysisApiClient({ baseUrl: apiBaseUrl }).predict({ answers, photo, signal });
}
