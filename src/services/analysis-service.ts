import type { AnalysisPhase, AnalysisResult, UploadedPhoto, UserAnswers } from "../models/wela";
import { AnalysisApiError, createAnalysisApiClient, waitForAnalysisReady } from "./analysis-api";
import { resolveAnalysisMode } from "./analysis-config";
import { runMockAnalysis } from "./mock-analysis";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export const analysisMode = resolveAnalysisMode(process.env.NEXT_PUBLIC_USE_MOCK_ANALYSIS);

export async function warmAnalysisService(signal?: AbortSignal): Promise<void> {
  if (analysisMode === "mock" || !apiBaseUrl) return;
  await waitForAnalysisReady({ baseUrl: apiBaseUrl, signal });
}

export async function runAnalysis({ answers, photo, signal, onPhase }: { answers: UserAnswers; photo: UploadedPhoto | null; signal?: AbortSignal; onPhase?: (phase: AnalysisPhase) => void }): Promise<AnalysisResult> {
  if (analysisMode === "mock") return runMockAnalysis(answers, signal);
  if (!apiBaseUrl) {
    throw new AnalysisApiError("configuration", "Set NEXT_PUBLIC_API_BASE_URL before using real analysis mode.");
  }
  if (!photo) {
    throw new AnalysisApiError("invalid-image", "Choose a JPEG, PNG, or WEBP image before starting local analysis.");
  }
  const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : undefined;
  onPhase?.("connecting");
  await waitForAnalysisReady({ baseUrl: apiBaseUrl, signal, requestId, onPreparing: () => onPhase?.("preparing") });
  return createAnalysisApiClient({ baseUrl: apiBaseUrl }).predict({ answers, photo, signal, requestId, onPhase });
}
