import type { AnalysisResult, SkinConcern, SkinType, UserAnswers } from "../models/wela";

export const supportedConditionIds = [
  "sensitive_skin",
  "inflammatory_acne",
  "dehydrated_skin",
  "dry_skin",
  "oily_skin",
  "comedones",
  "post_acne_marks",
  "pigmentation_dark_spots",
  "dull_skin",
  "fine_lines_wrinkles",
  "sagging_skin",
] as const;

export type ConditionId = (typeof supportedConditionIds)[number];
export type EvidenceSource = "model" | "questionnaire" | "combined";

export interface ConditionEvidence {
  conditionId: ConditionId;
  nameTh: string;
  source: EvidenceSource;
  supportingEvidence: string[];
}

export interface VisualFinding {
  id: "acne_lesion";
  source: "model";
  count: number;
  supportingEvidence: string;
}

export interface ConditionMappingResult {
  conditionIds: ConditionId[];
  conditions: ConditionEvidence[];
  visualFindings: VisualFinding[];
  needsClarification: string[];
}

const conditionNamesTh: Record<ConditionId, string> = {
  sensitive_skin: "ผิวแพ้ง่าย / ระคายเคืองง่าย",
  inflammatory_acne: "สิวอักเสบ",
  dehydrated_skin: "ผิวขาดน้ำ",
  dry_skin: "ผิวแห้ง",
  oily_skin: "ผิวมัน",
  comedones: "สิวอุดตัน",
  post_acne_marks: "รอยดำ / รอยแดงจากสิว",
  pigmentation_dark_spots: "ฝ้า กระ และจุดด่างดำ",
  dull_skin: "ผิวหมองคล้ำ",
  fine_lines_wrinkles: "ริ้วรอย",
  sagging_skin: "ผิวหย่อนคล้อย",
};

// Product-design mapping: only exact stored questionnaire values are mapped.
// A missing entry means the current question is not specific enough for that condition.
export const skinTypeConditionMap: Readonly<Partial<Record<SkinType, ConditionId>>> = {
  dry: "dry_skin",
  oily: "oily_skin",
  sensitive: "sensitive_skin",
};

export const concernConditionMap: Readonly<Partial<Record<SkinConcern, ConditionId>>> = {
  sensitivity: "sensitive_skin",
  "dark-spots": "pigmentation_dark_spots",
  "melasma-freckles": "pigmentation_dark_spots",
  dullness: "dull_skin",
  wrinkles: "fine_lines_wrinkles",
  "dry-flaking": "dry_skin",
};

const skinTypeEvidence: Partial<Record<SkinType, string>> = {
  dry: "คุณระบุว่ามีลักษณะผิวแห้ง",
  oily: "คุณระบุว่ามีลักษณะผิวมัน",
  sensitive: "คุณระบุว่ามีลักษณะผิวแพ้ง่าย",
};

const concernEvidence: Partial<Record<SkinConcern, string>> = {
  sensitivity: "คุณเลือกความกังวลเรื่องการระคายเคือง",
  "dark-spots": "คุณเลือกความกังวลเรื่องจุดด่างดำ",
  "melasma-freckles": "คุณเลือกความกังวลเรื่องฝ้าหรือกระ",
  dullness: "คุณเลือกความกังวลเรื่องผิวหมองคล้ำ",
  wrinkles: "คุณเลือกความกังวลเรื่องริ้วรอย",
  "dry-flaking": "คุณเลือกความกังวลเรื่องผิวแห้งลอก",
};

function addQuestionnaireEvidence(
  records: Map<ConditionId, ConditionEvidence>,
  conditionId: ConditionId,
  evidence: string,
) {
  const current = records.get(conditionId);
  if (current) {
    if (!current.supportingEvidence.includes(evidence)) current.supportingEvidence.push(evidence);
    return;
  }
  records.set(conditionId, {
    conditionId,
    nameTh: conditionNamesTh[conditionId],
    source: "questionnaire",
    supportingEvidence: [evidence],
  });
}

export function deriveConditionMapping(
  prediction: AnalysisResult | null,
  questionnaire: UserAnswers,
): ConditionMappingResult {
  const records = new Map<ConditionId, ConditionEvidence>();
  const needsClarification: string[] = [];

  if (questionnaire.skinType) {
    const conditionId = skinTypeConditionMap[questionnaire.skinType];
    const evidence = skinTypeEvidence[questionnaire.skinType];
    if (conditionId && evidence) addQuestionnaireEvidence(records, conditionId, evidence);
  }

  for (const concern of questionnaire.concerns) {
    const conditionId = concernConditionMap[concern];
    const evidence = concernEvidence[concern];
    if (conditionId && evidence) addQuestionnaireEvidence(records, conditionId, evidence);
  }

  if (questionnaire.concerns.includes("visible-breakouts")) {
    needsClarification.push("คำตอบเรื่องสิวและรอยสิวยังไม่แยกสิวอุดตัน สิวอักเสบ และรอยหลังสิว");
  }
  if (questionnaire.concerns.includes("large-pores") || questionnaire.concerns.includes("uneven-looking-tone")) {
    needsClarification.push("คำตอบบางข้อยังไม่มีเงื่อนไขที่ตรงกันในแค็ตตาล็อกผลิตภัณฑ์ปัจจุบัน");
  }

  const visualFindings: VisualFinding[] = [];
  if (prediction?.source === "api" && prediction.lesionCount > 0) {
    visualFindings.push({
      id: "acne_lesion",
      source: "model",
      count: prediction.lesionCount,
      supportingEvidence: `โมเดลทดลองทำเครื่องหมาย acne_lesion ${prediction.lesionCount} จุดจากรูปภาพนี้`,
    });
    needsClarification.push("ผล acne_lesion ไม่ได้แยกสิวอุดตันออกจากสิวอักเสบ จึงยังไม่ใช้เลือกผลิตภัณฑ์เฉพาะชนิดสิว");
  }

  const conditions = supportedConditionIds.flatMap((conditionId) => {
    const record = records.get(conditionId);
    return record ? [record] : [];
  });

  return {
    conditionIds: conditions.map((condition) => condition.conditionId),
    conditions,
    visualFindings,
    needsClarification: [...new Set(needsClarification)],
  };
}
