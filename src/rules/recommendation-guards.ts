import type {
  ConditionResult,
  RecommendationPrediction,
  RoutineStep,
  SkinConditionId,
  SkinConditionRule,
} from "../types/skin-rules";

export const CONSERVATIVE_ACTIVE_WARNING = "ควรเริ่มใช้ผลิตภัณฑ์ออกฤทธิ์ทีละชนิดและสังเกตการระคายเคือง";
export const SENSITIVE_SKIN_WARNING = "สำหรับผิวแพ้ง่าย ควรทดสอบผลิตภัณฑ์ใหม่ในบริเวณเล็ก ๆ ก่อน และเพิ่มผลิตภัณฑ์ออกฤทธิ์ทีละชนิด";

/** Product-design priority; it is not a clinical ranking and does not come from the source document. */
export const CONDITION_PRODUCT_PRIORITY: Record<SkinConditionId, number> = {
  sensitive_skin: 1,
  inflammatory_acne: 2,
  comedones: 2,
  dehydrated_skin: 3,
  dry_skin: 4,
  oily_skin: 4,
  post_acne_marks: 5,
  pigmentation_dark_spots: 5,
  dull_skin: 5,
  fine_lines_wrinkles: 5,
  sagging_skin: 5,
};

const activeStepTypes = new Set(["serum", "exfoliating serum", "anti-aging serum", "spot treatment"]);
const uniqueRoutineGroups = new Set(["cleanser", "sunscreen", "moisturizer"]);

export function predictionMatchesActiveRequest(
  prediction: RecommendationPrediction | null,
  selectedImageRequestId?: string,
): boolean {
  if (!prediction || prediction.source !== "api") return false;
  if (!selectedImageRequestId) return true;
  return prediction.provenance?.requestId === selectedImageRequestId;
}

export function rankConditions(conditions: ConditionResult[]): ConditionResult[] {
  return [...conditions].sort((left, right) => {
    const priority = CONDITION_PRODUCT_PRIORITY[left.conditionId] - CONDITION_PRODUCT_PRIORITY[right.conditionId];
    return priority || left.conditionId.localeCompare(right.conditionId);
  });
}

function normalizedStepGroup(type: string): string {
  const value = type.trim().toLowerCase();
  if (value.includes("cleanser")) return "cleanser";
  if (value.includes("sunscreen")) return "sunscreen";
  if (value.includes("moisturizer")) return "moisturizer";
  if (value.includes("serum")) return value;
  return value;
}

function routineStep(rule: SkinConditionRule, period: "am" | "pm", step: SkinConditionRule["routine"]["am"][number], optional: boolean): RoutineStep {
  return {
    id: `${period}-${rule.id}-${step.step}-${normalizedStepGroup(step.type).replaceAll(" ", "-")}`,
    conditionId: rule.id,
    displayNameTh: rule.name_th,
    source: "questionnaire",
    period,
    step: step.step,
    type: step.type,
    product: step.product,
    reason: step.reason,
    optional,
    supportingEvidence: [{ label: `กิจวัตรจากเงื่อนไข ${rule.name_th}`, value: step.type }],
    sourcePages: rule.source_pages,
  };
}

export function composeRoutine(
  primary: SkinConditionRule,
  secondary: SkinConditionRule[],
): { routine: { am: RoutineStep[]; pm: RoutineStep[] }; warnings: string[] } {
  const warnings = new Set<string>();
  const sensitiveActive = [primary, ...secondary].some((rule) => rule.id === "sensitive_skin");

  function compose(period: "am" | "pm"): RoutineStep[] {
    const base = primary.routine[period].map((step) => routineStep(primary, period, step, false));
    const occupied = new Set(base.map((step) => normalizedStepGroup(step.type)));
    let hasActive = base.some((step) => activeStepTypes.has(normalizedStepGroup(step.type)));

    secondary.forEach((rule) => {
      rule.routine[period].forEach((step) => {
        const group = normalizedStepGroup(step.type);
        const isActive = activeStepTypes.has(group);
        const duplicateCore = uniqueRoutineGroups.has(group) && occupied.has(group);
        const duplicateStep = occupied.has(group);
        if (duplicateCore || duplicateStep || (isActive && (hasActive || sensitiveActive))) {
          if (isActive) warnings.add(CONSERVATIVE_ACTIVE_WARNING);
          return;
        }
        occupied.add(group);
        if (isActive) hasActive = true;
        base.push(routineStep(rule, period, step, true));
      });
    });

    return base.map((step, index) => ({ ...step, step: index + 1 }));
  }

  if (sensitiveActive && secondary.length) {
    warnings.add(SENSITIVE_SKIN_WARNING);
    warnings.add(CONSERVATIVE_ACTIVE_WARNING);
  }

  return { routine: { am: compose("am"), pm: compose("pm") }, warnings: [...warnings] };
}
