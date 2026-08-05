export type AnalysisMode = "api" | "mock";

export function mockAnalysisEnabled(value: string | undefined): boolean {
  return value?.trim() === "true";
}

export function resolveAnalysisMode(value: string | undefined): AnalysisMode {
  return mockAnalysisEnabled(value) ? "mock" : "api";
}
