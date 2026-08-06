import type { SkinConcern, SkinType, SkincareGoal } from "../models/wela";
import type { QuestionnaireRuleAnswers, SkinConditionId, SupportingEvidence } from "../types/skin-rules";

export const needsClarification = "needs_clarification" as const;
export type ConditionMappingValue = SkinConditionId | typeof needsClarification | null;

/**
 * Product-design mapping from exact stored questionnaire values to approved source IDs.
 * A null value is intentionally unsupported. No fuzzy matching is permitted here.
 */
export const QUESTIONNAIRE_CONDITION_MAPPING: {
  skinType: Record<SkinType, ConditionMappingValue>;
  concerns: Record<SkinConcern, ConditionMappingValue>;
  goals: Record<SkincareGoal, ConditionMappingValue>;
} = {
  skinType: {
    balanced: null,
    dry: "dry_skin",
    oily: "oily_skin",
    combination: null,
    unsure: "sensitive_skin",
  },
  concerns: {
    "visible-breakouts": needsClarification,
    sensitivity: "sensitive_skin",
    "uneven-looking-tone": needsClarification,
    "dark-circles": null,
    none: null,
    "dark-spots": "pigmentation_dark_spots",
    wrinkles: "fine_lines_wrinkles",
    "large-pores": needsClarification,
    dullness: "dull_skin",
    "melasma-freckles": "pigmentation_dark_spots",
    "dry-flaking": "dry_skin",
  },
  goals: {
    "calmer-looking-skin": null,
    "comfortable-hydration": null,
    "more-even-looking-tone": null,
    "simpler-routine": null,
  },
};

const questionnaireLabels: Record<string, string> = {
  dry: "ลักษณะผิวที่เลือก: ผิวแห้ง",
  oily: "ลักษณะผิวที่เลือก: ผิวมัน",
  unsure: "ลักษณะผิวที่เลือก: ผิวแพ้ง่าย",
  sensitivity: "ความกังวลที่เลือก: ผิวระคายเคืองง่าย",
  "visible-breakouts": "ความกังวลที่เลือก: สิวและรอยสิว (ยังไม่แยกชนิด)",
  "uneven-looking-tone": "ความกังวลที่เลือก: สีผิวไม่สม่ำเสมอ (ยังไม่ระบุสาเหตุ)",
  "dark-spots": "ความกังวลที่เลือก: จุดด่างดำ",
  wrinkles: "ความกังวลที่เลือก: ริ้วรอย",
  "large-pores": "ความกังวลที่เลือก: รูขุมขนกว้าง (ยังไม่ระบุสภาพผิว)",
  dullness: "ความกังวลที่เลือก: ผิวหมองคล้ำ",
  "melasma-freckles": "ความกังวลที่เลือก: ฝ้า / กระ",
  "dry-flaking": "ความกังวลที่เลือก: ผิวแห้งลอก",
};

export interface MappedQuestionnaireCondition {
  conditionId: SkinConditionId;
  evidence: SupportingEvidence;
}

export interface QuestionnaireMappingResult {
  conditions: MappedQuestionnaireCondition[];
  clarificationEvidence: SupportingEvidence[];
}

export function mapQuestionnaireConditions(questionnaire: QuestionnaireRuleAnswers): QuestionnaireMappingResult {
  const conditions: MappedQuestionnaireCondition[] = [];
  const clarificationEvidence: SupportingEvidence[] = [];

  function apply(value: string, mapped: ConditionMappingValue): void {
    const evidence = { label: questionnaireLabels[value] ?? `คำตอบที่เลือก: ${value}`, value };
    if (mapped === needsClarification) clarificationEvidence.push(evidence);
    else if (mapped) conditions.push({ conditionId: mapped, evidence });
  }

  if (questionnaire.skinType) apply(questionnaire.skinType, QUESTIONNAIRE_CONDITION_MAPPING.skinType[questionnaire.skinType]);
  questionnaire.concerns.forEach((concern) => apply(concern, QUESTIONNAIRE_CONDITION_MAPPING.concerns[concern]));
  questionnaire.goals.forEach((goal) => apply(goal, QUESTIONNAIRE_CONDITION_MAPPING.goals[goal]));
  questionnaire.explicitConditions?.forEach((conditionId) => {
    conditions.push({
      conditionId,
      evidence: { label: "คำตอบเฉพาะที่ผู้ใช้ระบุโดยตรง", value: conditionId },
    });
  });

  return { conditions, clarificationEvidence };
}
