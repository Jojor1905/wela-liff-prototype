import assert from "node:assert/strict";
import test from "node:test";
import { mockAnalysisEnabled, resolveAnalysisMode } from "../src/services/analysis-config";

test('only the explicit string "true" enables mock analysis', () => {
  assert.equal(mockAnalysisEnabled("true"), true);
  assert.equal(resolveAnalysisMode("true"), "mock");
  assert.equal(mockAnalysisEnabled("false"), false);
  assert.equal(resolveAnalysisMode("false"), "api");
  assert.equal(resolveAnalysisMode(undefined), "api");
  assert.equal(resolveAnalysisMode("1"), "api");
});
