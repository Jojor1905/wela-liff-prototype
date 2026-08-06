import rawRules from "../data/wela_skin_rules_source.json";
import { mapQuestionnaireConditions } from "./condition-mapping";
import {
  CONDITION_PRODUCT_PRIORITY,
  CONSERVATIVE_ACTIVE_WARNING,
  SENSITIVE_SKIN_WARNING,
  composeRoutine,
  predictionMatchesActiveRequest,
  rankConditions,
} from "./recommendation-guards";
import {
  skinConditionIds,
  type ConditionResult,
  type EvidenceItem,
  type RecommendationInput,
  type RuleProductRecommendation,
  type SkinConditionId,
  type SkinConditionRule,
  type SkinRecommendationResult,
  type SkinRulesSource,
  type SupportingEvidence,
  type VisualFinding,
} from "../types/skin-rules";

const ACADEMIC_DISCLAIMER = "ผลลัพธ์นี้เป็นกฎสำหรับต้นแบบเชิงวิชาการ ใช้ข้อมูลจากแบบสอบถามและผล acne_lesion ที่โมเดลส่งกลับเท่านั้น ไม่ใช่การวินิจฉัย การรักษา หรือคำแนะนำทางการแพทย์";
const CLARIFICATION_WARNING = "ข้อมูลปัจจุบันยังไม่เพียงพอสำหรับแยกสภาพผิวบางรายการ โปรดตอบคำถามเฉพาะเพิ่มเติมแทนการคาดเดา";
const regionLabels: Record<string, string> = {
  forehead: "หน้าผาก",
  leftCheek: "แก้มซ้าย",
  rightCheek: "แก้มขวา",
  nose: "จมูก",
  chin: "คาง",
  none: "ไม่พบบริเวณเด่น",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isProductRecord(value: unknown): boolean {
  return isRecord(value) && typeof value.name === "string" && typeof value.reason === "string";
}

function isRoutineStep(value: unknown): boolean {
  return isRecord(value) && typeof value.step === "number" && typeof value.type === "string" && typeof value.product === "string" && typeof value.reason === "string";
}

function isStringArrayRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every(isStringArray);
}

function validateCondition(value: unknown): value is SkinConditionRule {
  if (!isRecord(value) || !skinConditionIds.includes(value.id as SkinConditionId)) return false;
  const ingredientsValid = isStringArray(value.recommended_ingredients) || isStringArrayRecord(value.recommended_ingredients);
  const productsValid = isRecord(value.products) && Object.values(value.products).every((items) => Array.isArray(items) && items.every(isProductRecord));
  const routine = value.routine;
  return (
    typeof value.name_th === "string" &&
    typeof value.name_en === "string" &&
    ["skin_type", "skin_condition", "skin_concern"].includes(String(value.type)) &&
    Array.isArray(value.source_pages) && value.source_pages.every((page) => Number.isInteger(page) && Number(page) > 0) &&
    isStringArray(value.characteristics) &&
    isStringArray(value.causes) &&
    isStringArray(value.goals) &&
    ingredientsValid &&
    isStringArrayRecord(value.recommended_product_types) &&
    productsValid &&
    isRecord(routine) &&
    Array.isArray(routine.am) && routine.am.every(isRoutineStep) &&
    Array.isArray(routine.pm) && routine.pm.every(isRoutineStep)
  );
}

export function validateSkinRulesSource(value: unknown): SkinRulesSource {
  if (
    !isRecord(value) ||
    typeof value.schema_version !== "string" ||
    value.language !== "th" ||
    typeof value.source_title !== "string" ||
    typeof value.source_note !== "string" ||
    !isRecord(value.important_scope) ||
    typeof value.important_scope.vision_model !== "string" ||
    typeof value.important_scope.questionnaire !== "string" ||
    typeof value.important_scope.rule_engine !== "string" ||
    value.important_scope.not_medical_diagnosis !== true ||
    !Array.isArray(value.conditions)
  ) {
    throw new Error("Invalid Wela skin-rules source metadata.");
  }
  if (value.conditions.length !== skinConditionIds.length || !value.conditions.every(validateCondition)) {
    throw new Error("The Wela skin-rules source must contain 11 valid condition records.");
  }
  const ids = value.conditions.map((condition) => condition.id);
  if (new Set(ids).size !== skinConditionIds.length || skinConditionIds.some((id) => !ids.includes(id))) {
    throw new Error("The Wela skin-rules source condition IDs do not match the approved schema.");
  }
  return value as unknown as SkinRulesSource;
}

export const skinRulesSource = validateSkinRulesSource(rawRules);
const rulesById = new Map(skinRulesSource.conditions.map((condition) => [condition.id, condition]));

function ruleFor(id: SkinConditionId): SkinConditionRule {
  const rule = rulesById.get(id);
  if (!rule) throw new Error(`Missing approved rule for ${id}.`);
  return rule;
}

function flattenIngredients(rule: SkinConditionRule): string[] {
  return Array.isArray(rule.recommended_ingredients)
    ? rule.recommended_ingredients
    : Object.values(rule.recommended_ingredients).flat();
}

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function meanDetectionConfidence(input: RecommendationInput["prediction"]): number | undefined {
  if (!input?.detections.length) return undefined;
  return input.detections.reduce((sum, detection) => sum + detection.confidence, 0) / input.detections.length;
}

function conditionResults(input: RecommendationInput): { conditions: ConditionResult[]; clarificationEvidence: SupportingEvidence[] } {
  const mapped = mapQuestionnaireConditions(input.questionnaire);
  const evidenceByCondition = new Map<SkinConditionId, SupportingEvidence[]>();
  mapped.conditions.forEach(({ conditionId, evidence }) => {
    evidenceByCondition.set(conditionId, [...(evidenceByCondition.get(conditionId) ?? []), evidence]);
  });
  const conditions = [...evidenceByCondition].map(([conditionId, supportingEvidence]) => {
    const rule = ruleFor(conditionId);
    return {
      conditionId,
      displayNameTh: rule.name_th,
      source: "questionnaire" as const,
      supportingEvidence: supportingEvidence.map((evidence) => evidence.value === conditionId ? { ...evidence, value: rule.name_th } : evidence),
      sourcePages: rule.source_pages,
    };
  });
  return { conditions: rankConditions(conditions), clarificationEvidence: mapped.clarificationEvidence };
}

function visualFindings(input: RecommendationInput): VisualFinding[] {
  if (!predictionMatchesActiveRequest(input.prediction, input.selectedImageRequestId) || !input.prediction || input.prediction.lesionCount <= 0) return [];
  const questionnaireAlsoMentionsAcne = input.questionnaire.concerns.includes("visible-breakouts");
  const regions = Object.fromEntries(Object.entries(input.prediction.regionCounts).filter(([, count]) => count > 0));
  const confidence = meanDetectionConfidence(input.prediction);
  return [{
    id: "visible_acne_lesions",
    displayNameTh: "จุด acne_lesion ที่โมเดลทำเครื่องหมาย",
    source: questionnaireAlsoMentionsAcne ? "combined" : "model",
    count: input.prediction.lesionCount,
    regions,
    ...(confidence === undefined ? {} : { confidence }),
    supportingEvidence: [
      { label: "จำนวนจากผล /predict ล่าสุด", value: String(input.prediction.lesionCount) },
      { label: "บริเวณเด่นจากโมเดล", value: regionLabels[input.prediction.dominantRegion] ?? input.prediction.dominantRegion },
    ],
    sourcePages: [],
  }];
}

function productsFor(conditions: ConditionResult[]): RuleProductRecommendation[] {
  const sensitiveActive = conditions.some((condition) => condition.conditionId === "sensitive_skin");
  const primaryId = conditions[0]?.conditionId;
  const products: RuleProductRecommendation[] = [];
  conditions.forEach((condition) => {
    const rule = ruleFor(condition.conditionId);
    Object.entries(rule.products).forEach(([category, alternatives]) => {
      alternatives.forEach((product, index) => {
        const optional = condition.conditionId !== primaryId || index > 0;
        const patchTestRecommended = sensitiveActive && condition.conditionId !== "sensitive_skin";
        products.push({
          id: `${condition.conditionId}-${category}-${index + 1}`,
          conditionId: condition.conditionId,
          displayNameTh: rule.name_th,
          source: condition.source,
          category,
          name: product.name,
          reason: product.reason,
          alternativeGroup: category,
          optional: optional || patchTestRecommended,
          patchTestRecommended,
          supportingEvidence: condition.supportingEvidence,
          sourcePages: rule.source_pages,
        });
      });
    });
  });
  return [...new Map(products.map((product) => [product.name, product])).values()];
}

export function buildSkinRecommendation(input: RecommendationInput): SkinRecommendationResult {
  const { conditions, clarificationEvidence } = conditionResults(input);
  const selectedConditions = conditions.slice(0, 3);
  const primaryCondition = selectedConditions[0] ?? null;
  const secondaryConditions = selectedConditions.slice(1, 3);
  const findings = visualFindings(input);
  const predictionAccepted = predictionMatchesActiveRequest(input.prediction, input.selectedImageRequestId);
  const warnings = new Set<string>();
  const evidence: EvidenceItem[] = conditions.map((condition) => ({
    id: `questionnaire-${condition.conditionId}`,
    label: condition.displayNameTh,
    source: condition.source,
    supportingEvidence: condition.supportingEvidence,
    sourcePages: condition.sourcePages,
  }));

  findings.forEach((finding) => evidence.push({
    id: finding.id,
    label: finding.displayNameTh,
    source: finding.source,
    supportingEvidence: finding.supportingEvidence,
    ...(finding.confidence === undefined ? {} : { confidence: finding.confidence }),
    sourcePages: finding.sourcePages,
  }));

  if (clarificationEvidence.length) {
    warnings.add(CLARIFICATION_WARNING);
    evidence.push({
      id: "needs_clarification",
      label: "ต้องการข้อมูลเพิ่มเติม",
      source: "questionnaire",
      supportingEvidence: clarificationEvidence,
      sourcePages: [],
    });
  }
  if (input.prediction?.source === "api" && !predictionAccepted) {
    warnings.add("ผลจากภาพไม่ตรงกับคำขอปัจจุบัน จึงไม่นำผลภาพเดิมมาใช้");
  }

  let routine: SkinRecommendationResult["routine"] = { am: [], pm: [] };
  if (primaryCondition) {
    const composed = composeRoutine(ruleFor(primaryCondition.conditionId), secondaryConditions.map((condition) => ruleFor(condition.conditionId)));
    routine = composed.routine;
    composed.warnings.forEach((warning) => warnings.add(warning));
  } else {
    warnings.add(CLARIFICATION_WARNING);
  }

  if (selectedConditions.some((condition) => condition.conditionId === "sensitive_skin") && selectedConditions.length > 1) {
    warnings.add(SENSITIVE_SKIN_WARNING);
    warnings.add(CONSERVATIVE_ACTIVE_WARNING);
  }

  const selectedRules = selectedConditions.map((condition) => ruleFor(condition.conditionId));
  return {
    primaryCondition,
    secondaryConditions,
    visualFindings: findings,
    goals: dedupe(selectedRules.flatMap((rule) => rule.goals)),
    recommendedIngredients: dedupe(selectedRules.flatMap(flattenIngredients)),
    products: productsFor(selectedConditions),
    routine,
    evidence,
    warnings: [...warnings],
    disclaimer: ACADEMIC_DISCLAIMER,
    needsClarification: !primaryCondition || clarificationEvidence.length > 0,
    ...(predictionAccepted && input.prediction?.provenance?.requestId ? { requestId: input.prediction.provenance.requestId } : {}),
  };
}

export function conditionPriority(id: SkinConditionId): number {
  return CONDITION_PRODUCT_PRIORITY[id];
}
