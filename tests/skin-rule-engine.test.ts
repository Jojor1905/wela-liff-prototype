import assert from "node:assert/strict";
import test from "node:test";
import rawRules from "../src/data/wela_skin_rules_source.json";
import { QUESTIONNAIRE_CONDITION_MAPPING, needsClarification } from "../src/rules/condition-mapping";
import { CONSERVATIVE_ACTIVE_WARNING, SENSITIVE_SKIN_WARNING } from "../src/rules/recommendation-guards";
import { buildSkinRecommendation, skinRulesSource, validateSkinRulesSource } from "../src/rules/skin-rule-engine";
import type { RecommendationInput, RecommendationPrediction, SkinConditionId } from "../src/types/skin-rules";

const emptyQuestionnaire: RecommendationInput["questionnaire"] = { concerns: [], goals: [] };

const prediction: RecommendationPrediction = {
  source: "api",
  provenance: {
    requestId: "request-current-photo",
    inputSha256Prefix: "a1b2c3d4e5f6",
    inferenceExecuted: true,
    rawDetectionCount: 3,
    postThresholdDetectionCount: 2,
  },
  lesionCount: 2,
  dominantRegion: "rightCheek",
  detections: [
    { className: "acne_lesion", confidence: 0.8, region: "rightCheek" },
    { className: "acne_lesion", confidence: 0.6, region: "chin" },
  ],
  regionCounts: { forehead: 0, leftCheek: 0, rightCheek: 1, chin: 1, nose: 0 },
};

function resultFor(questionnaire: RecommendationInput["questionnaire"], currentPrediction: RecommendationPrediction | null = null) {
  return buildSkinRecommendation({
    prediction: currentPrediction,
    questionnaire,
    selectedImageRequestId: currentPrediction?.provenance?.requestId,
  });
}

test("oily questionnaire answer maps to oily_skin", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "oily" });
  assert.equal(QUESTIONNAIRE_CONDITION_MAPPING.skinType.oily, "oily_skin");
  assert.equal(result.primaryCondition?.conditionId, "oily_skin");
  assert.equal(result.primaryCondition?.source, "questionnaire");
  assert.equal(result.primaryCondition?.confidence, undefined);
});

test("dry questionnaire answer maps to dry_skin", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "dry" });
  assert.equal(result.primaryCondition?.conditionId, "dry_skin");
});

test("dehydrated skin maps only from explicit evidence", () => {
  const hydrationGoalOnly = resultFor({ ...emptyQuestionnaire, skinType: "dry", goals: ["comfortable-hydration"] });
  assert.equal(hydrationGoalOnly.evidence.some((item) => item.label.includes("ขาดน้ำ")), false);
  assert.equal(hydrationGoalOnly.primaryCondition?.conditionId, "dry_skin");

  const explicit = resultFor({ ...emptyQuestionnaire, explicitConditions: ["dehydrated_skin"] });
  assert.equal(explicit.primaryCondition?.conditionId, "dehydrated_skin");
});

test("sensitive questionnaire answer maps to sensitive_skin", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "unsure" });
  assert.equal(result.primaryCondition?.conditionId, "sensitive_skin");
});

test("generic acne concern requests clarification instead of guessing an acne subtype", () => {
  const result = resultFor({ ...emptyQuestionnaire, concerns: ["visible-breakouts"] }, prediction);
  assert.equal(QUESTIONNAIRE_CONDITION_MAPPING.concerns["visible-breakouts"], needsClarification);
  assert.equal(result.evidence.some((item) => item.id === "needs_clarification"), true);
  assert.equal(result.evidence.some((item) => ["comedones", "inflammatory_acne"].includes(item.id)), false);
  assert.equal(result.visualFindings[0].id, "visible_acne_lesions");
});

test("model acne evidence does not create pigmentation or wrinkle conditions", () => {
  const result = resultFor(emptyQuestionnaire, prediction);
  const conditionIds = result.evidence.map((item) => item.id);
  assert.equal(conditionIds.some((id) => id.includes("pigmentation_dark_spots")), false);
  assert.equal(conditionIds.some((id) => id.includes("fine_lines_wrinkles")), false);
  assert.equal(result.primaryCondition, null);
});

test("questionnaire answers do not generate model counts, boxes, regions, or confidence", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "oily", concerns: ["visible-breakouts"] });
  assert.deepEqual(result.visualFindings, []);
  assert.equal(result.primaryCondition?.confidence, undefined);
  assert.equal(result.requestId, undefined);
});

test("every recommended product comes from the approved JSON product catalogue", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "oily", concerns: ["dark-spots"] });
  const catalogue = new Set(skinRulesSource.conditions.flatMap((condition) => Object.values(condition.products).flat().map((product) => product.name)));
  assert.ok(result.products.length > 0);
  result.products.forEach((product) => assert.equal(catalogue.has(product.name), true, product.name));
});

test("the primary condition routine is the composition base", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "oily", concerns: ["dark-spots"] });
  const oily = skinRulesSource.conditions.find((condition) => condition.id === "oily_skin");
  assert.ok(oily);
  assert.deepEqual(result.routine.am.slice(0, oily.routine.am.length).map((step) => step.product), oily.routine.am.map((step) => step.product));
  assert.deepEqual(result.routine.pm.slice(0, oily.routine.pm.length).map((step) => step.product), oily.routine.pm.map((step) => step.product));
});

test("secondary conditions do not duplicate cleanser, sunscreen, or moisturizer routine steps", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "oily", concerns: ["dark-spots", "dullness"] });
  for (const period of [result.routine.am, result.routine.pm]) {
    for (const type of ["cleanser", "sunscreen", "moisturizer"]) {
      assert.ok(period.filter((step) => step.type.toLowerCase().includes(type)).length <= 1, `${type} duplicated`);
    }
  }
});

test("sensitive-skin guard keeps its gentle base and marks secondary products optional", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "unsure", concerns: ["dullness"] });
  const sensitive = skinRulesSource.conditions.find((condition) => condition.id === "sensitive_skin");
  assert.ok(sensitive);
  assert.equal(result.primaryCondition?.conditionId, "sensitive_skin");
  assert.deepEqual(result.routine.am.slice(0, sensitive.routine.am.length).map((step) => step.product), sensitive.routine.am.map((step) => step.product));
  assert.equal(result.products.filter((product) => product.conditionId === "dull_skin").every((product) => product.optional && product.patchTestRecommended), true);
  assert.ok(result.warnings.includes(SENSITIVE_SKIN_WARNING));
  assert.ok(result.warnings.includes(CONSERVATIVE_ACTIVE_WARNING));
});

test("overlapping active routine steps keep the primary step and add a conservative warning", () => {
  const result = resultFor({ ...emptyQuestionnaire, skinType: "oily", concerns: ["dullness", "wrinkles"] });
  for (const period of [result.routine.am, result.routine.pm]) {
    const activeSteps = period.filter((step) => step.type.toLowerCase().includes("serum") || step.type.toLowerCase().includes("spot treatment"));
    assert.ok(activeSteps.length <= 1);
  }
  assert.ok(result.warnings.includes(CONSERVATIVE_ACTIVE_WARNING));
});

test("only a prediction matching the active request ID controls visual results", () => {
  const stale = buildSkinRecommendation({ prediction, questionnaire: emptyQuestionnaire, selectedImageRequestId: "request-new-photo" });
  assert.deepEqual(stale.visualFindings, []);
  assert.equal(stale.requestId, undefined);
  assert.ok(stale.warnings.some((warning) => warning.includes("ไม่ตรงกับคำขอปัจจุบัน")));

  const latest = buildSkinRecommendation({ prediction, questionnaire: emptyQuestionnaire, selectedImageRequestId: "request-current-photo" });
  assert.equal(latest.visualFindings[0].count, 2);
  assert.equal(latest.requestId, "request-current-photo");
});

test("a new image input cannot retain the previous image-bound recommendation", () => {
  const previous = resultFor({ ...emptyQuestionnaire, skinType: "oily" }, prediction);
  const replacementPending = resultFor({ ...emptyQuestionnaire, skinType: "oily" }, null);
  assert.equal(previous.requestId, "request-current-photo");
  assert.equal(previous.visualFindings.length, 1);
  assert.equal(replacementPending.requestId, undefined);
  assert.deepEqual(replacementPending.visualFindings, []);
});

test("missing evidence returns clarification without fabricating a condition", () => {
  const result = resultFor(emptyQuestionnaire);
  assert.equal(result.primaryCondition, null);
  assert.equal(result.needsClarification, true);
  assert.ok(result.warnings.some((warning) => warning.includes("ไม่เพียงพอ")));
  assert.deepEqual(result.products, []);
  assert.deepEqual(result.routine, { am: [], pm: [] });
});

test("all 11 approved condition records validate against the TypeScript runtime schema", () => {
  const source = validateSkinRulesSource(rawRules);
  assert.equal(source.conditions.length, 11);
  assert.deepEqual(new Set(source.conditions.map((condition) => condition.id)), new Set<SkinConditionId>([
    "oily_skin", "dry_skin", "dehydrated_skin", "sensitive_skin", "comedones", "inflammatory_acne",
    "post_acne_marks", "pigmentation_dark_spots", "dull_skin", "fine_lines_wrinkles", "sagging_skin",
  ]));
});
