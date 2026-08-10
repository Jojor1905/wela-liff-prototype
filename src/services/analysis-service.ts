import type { AnalysisPhase, AnalysisResult, UploadedPhoto, UserAnswers } from "../models/wela";
import { analysisInputIsValid, auditAnalysisInput } from "../lib/analysis-validation";
import { AnalysisApiError, createAnalysisApiClient, waitForAnalysisReady } from "./analysis-api";
import { resolveAnalysisMode } from "./analysis-config";
import { runMockAnalysis } from "./mock-analysis";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export const analysisMode = resolveAnalysisMode(process.env.NEXT_PUBLIC_USE_MOCK_ANALYSIS);

export async function warmAnalysisService(signal?: AbortSignal): Promise<void> {
  if (analysisMode === "mock" || !apiBaseUrl) return;
  await waitForAnalysisReady({ baseUrl: apiBaseUrl, signal });
}

export async function runAnalysis({ answers, photo, questionnaireRequired = true, signal, onPhase }: { answers: UserAnswers; photo: UploadedPhoto | null; questionnaireRequired?: boolean; signal?: AbortSignal; onPhase?: (phase: AnalysisPhase) => void }): Promise<AnalysisResult> {
  const audit = auditAnalysisInput(answers, photo, { questionnaireRequired });
  if (!analysisInputIsValid(audit)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Wela analysis validation failed", {
        hasSelectedFile: audit.hasSelectedFile,
        missingQuestionnaireFields: audit.missingQuestionnaireFields,
        invalidQuestionnaireFields: audit.invalidQuestionnaireFields,
      });
    }
    if (!audit.hasSelectedFile) {
      throw new AnalysisApiError("missing-image", "No selected image is available for analysis.");
    }
    if (!audit.hasValidImageFile) {
      throw new AnalysisApiError("invalid-image", "The selected image is empty or has an unsupported format.");
    }
    throw new AnalysisApiError("validation", "The questionnaire is incomplete or contains an invalid answer.");
  }
  if (analysisMode === "mock") return runMockAnalysis(answers, signal);
  if (!apiBaseUrl) {
    throw new AnalysisApiError("configuration", "Set NEXT_PUBLIC_API_BASE_URL before using real analysis mode.");
  }
  // The validation above narrows this for the analysis request.
  if (!photo) throw new AnalysisApiError("missing-image", "No selected image is available for analysis.");
  const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : undefined;
  onPhase?.("connecting");
  await waitForAnalysisReady({ baseUrl: apiBaseUrl, signal, requestId, onPreparing: () => onPhase?.("preparing") });
  return createAnalysisApiClient({ baseUrl: apiBaseUrl }).predict({ answers, photo, questionnaireRequired, signal, requestId, onPhase });
}
