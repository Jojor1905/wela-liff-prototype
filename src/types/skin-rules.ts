import type { AnalysisResult, RegionCounts, UserAnswers } from "../models/wela";

export const skinConditionIds = [
  "oily_skin",
  "dry_skin",
  "dehydrated_skin",
  "sensitive_skin",
  "comedones",
  "inflammatory_acne",
  "post_acne_marks",
  "pigmentation_dark_spots",
  "dull_skin",
  "fine_lines_wrinkles",
  "sagging_skin",
] as const;

export type SkinConditionId = (typeof skinConditionIds)[number];
export type EvidenceSource = "model" | "questionnaire" | "combined";
export type ConditionType = "skin_type" | "skin_condition" | "skin_concern";

export interface SkinRuleProduct {
  name: string;
  reason: string;
}

export interface SkinRuleRoutineStep {
  step: number;
  type: string;
  product: string;
  reason: string;
}

export interface SkinConditionRule {
  id: SkinConditionId;
  name_th: string;
  name_en: string;
  type: ConditionType;
  source_pages: number[];
  characteristics: string[];
  causes: string[];
  goals: string[];
  recommended_ingredients: string[] | Record<string, string[]>;
  recommended_product_types: Record<string, string[]>;
  products: Record<string, SkinRuleProduct[]>;
  routine: {
    am: SkinRuleRoutineStep[];
    pm: SkinRuleRoutineStep[];
  };
}

export interface SkinRulesSource {
  schema_version: string;
  language: "th";
  source_title: string;
  source_note: string;
  important_scope: {
    vision_model: string;
    questionnaire: string;
    rule_engine: string;
    not_medical_diagnosis: true;
  };
  conditions: SkinConditionRule[];
}

export type QuestionnaireRuleAnswers = UserAnswers & {
  /** Reserved for future dedicated questions whose answer explicitly names one source condition. */
  explicitConditions?: SkinConditionId[];
};

export type RecommendationPrediction = Pick<
  AnalysisResult,
  "source" | "provenance" | "lesionCount" | "dominantRegion" | "detections" | "regionCounts"
>;

export interface RecommendationInput {
  prediction: RecommendationPrediction | null;
  questionnaire: QuestionnaireRuleAnswers;
  selectedImageRequestId?: string;
}

export interface SupportingEvidence {
  label: string;
  value: string;
}

export interface ConditionResult {
  conditionId: SkinConditionId;
  displayNameTh: string;
  source: EvidenceSource;
  supportingEvidence: SupportingEvidence[];
  confidence?: number;
  sourcePages: number[];
}

export interface VisualFinding {
  id: "visible_acne_lesions";
  displayNameTh: string;
  source: EvidenceSource;
  count: number;
  regions: Partial<RegionCounts>;
  confidence?: number;
  supportingEvidence: SupportingEvidence[];
  sourcePages: number[];
}

export interface EvidenceItem {
  id: string;
  label: string;
  source: EvidenceSource;
  supportingEvidence: SupportingEvidence[];
  confidence?: number;
  sourcePages: number[];
}

export interface RuleProductRecommendation {
  id: string;
  conditionId: SkinConditionId;
  displayNameTh: string;
  source: EvidenceSource;
  category: string;
  name: string;
  reason: string;
  alternativeGroup: string;
  optional: boolean;
  patchTestRecommended: boolean;
  supportingEvidence: SupportingEvidence[];
  sourcePages: number[];
}

export interface RoutineStep {
  id: string;
  conditionId: SkinConditionId;
  displayNameTh: string;
  source: EvidenceSource;
  period: "am" | "pm";
  step: number;
  type: string;
  product: string;
  reason: string;
  optional: boolean;
  supportingEvidence: SupportingEvidence[];
  sourcePages: number[];
}

export interface SkinRecommendationResult {
  primaryCondition: ConditionResult | null;
  secondaryConditions: ConditionResult[];
  visualFindings: VisualFinding[];
  goals: string[];
  recommendedIngredients: string[];
  products: RuleProductRecommendation[];
  routine: {
    am: RoutineStep[];
    pm: RoutineStep[];
  };
  evidence: EvidenceItem[];
  warnings: string[];
  disclaimer: string;
  needsClarification: boolean;
  requestId?: string;
}
