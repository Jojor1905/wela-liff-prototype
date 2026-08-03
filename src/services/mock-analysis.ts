import type { AnalysisResult, UserAnswers } from "@/src/models/wela";

const mockResult: AnalysisResult = {
  source: "mock",
  lesionCount: 7,
  dominantRegion: "rightCheek",
  confidenceSummary: "Moderate",
  severityLevel: "Low",
  skinScore: 82,
  detections: [
    { className: "acne_lesion", confidence: 0.79, region: "rightCheek" },
    { className: "acne_lesion", confidence: 0.74, region: "leftCheek" },
    { className: "acne_lesion", confidence: 0.72, region: "chin" },
  ],
  regionCounts: { forehead: 1, leftCheek: 2, rightCheek: 3, chin: 1, nose: 0 },
  insights: [
    "The mock visual output places most visible spots around the right cheek.",
    "Your selected skin type and wider concerns remain questionnaire-based.",
  ],
  questionnaireInsights: [
    "Your stated skin type and cosmetic concerns guide the product categories in this mock routine.",
    "No questionnaire answer is treated as a visually detected condition.",
  ],
  recommendations: [
    "Keep the routine short and introduce one product at a time.",
    "Use a gentle cleanse, lightweight serum, moisturiser, and daily sunscreen.",
  ],
  productRecommendations: [
    {
      category: "cleanser",
      focus: "gentle daily cleanser",
      rationale: "Selected from the reported skin type and routine goal.",
    },
    {
      category: "sunscreen",
      focus: "broad-spectrum daily sunscreen",
      rationale: "A general cosmetic routine category; no treatment claim is made.",
    },
  ],
  disclaimer:
    "Experimental visual analysis for prototype demonstration only. Results may be incomplete or inaccurate and are not a medical diagnosis.",
};

export async function runMockAnalysis(
  answers: UserAnswers,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  void answers;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 1200);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("The request was cancelled.", "AbortError"));
      },
      { once: true },
    );
  });
  return structuredClone(mockResult);
}
