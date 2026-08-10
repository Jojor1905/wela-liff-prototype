import {
  genderValues,
  type UploadedPhoto,
  type UserAnswers,
} from "../models/wela";

export const requiredQuestionnaireFields = [
  "gender",
  "ageRange",
  "skinType",
  "concerns",
  "goals",
] as const;

export type RequiredQuestionnaireField = (typeof requiredQuestionnaireFields)[number];

export interface AnalysisInputAudit {
  hasSelectedFile: boolean;
  hasValidImageFile: boolean;
  missingQuestionnaireFields: RequiredQuestionnaireField[];
  invalidQuestionnaireFields: RequiredQuestionnaireField[];
}

const ageRanges = new Set(["18–29", "30–39", "40–49", "50+"]);
const skinTypes = new Set(["balanced", "dry", "oily", "combination", "sensitive"]);
const concerns = new Set([
  "visible-breakouts",
  "sensitivity",
  "uneven-looking-tone",
  "dark-circles",
  "none",
  "dark-spots",
  "wrinkles",
  "large-pores",
  "dullness",
  "melasma-freckles",
  "dry-flaking",
]);
const goals = new Set([
  "calmer-looking-skin",
  "comfortable-hydration",
  "more-even-looking-tone",
  "simpler-routine",
]);
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

export function auditAnalysisInput(
  answers: UserAnswers,
  photo: UploadedPhoto | null,
  { questionnaireRequired = true }: { questionnaireRequired?: boolean } = {},
): AnalysisInputAudit {
  const missingQuestionnaireFields: RequiredQuestionnaireField[] = [];
  const invalidQuestionnaireFields: RequiredQuestionnaireField[] = [];

  if (questionnaireRequired) {
    const gender = answers.gender as unknown;
    const ageRange = answers.ageRange as unknown;
    const skinType = answers.skinType as unknown;

    if (gender === undefined || gender === null || gender === "") missingQuestionnaireFields.push("gender");
    else if (typeof gender !== "string" || !genderValues.includes(gender as (typeof genderValues)[number])) invalidQuestionnaireFields.push("gender");

    if (ageRange === undefined || ageRange === null || ageRange === "") missingQuestionnaireFields.push("ageRange");
    else if (typeof ageRange !== "string" || !ageRanges.has(ageRange)) invalidQuestionnaireFields.push("ageRange");

    if (skinType === undefined || skinType === null || skinType === "") missingQuestionnaireFields.push("skinType");
    else if (typeof skinType !== "string" || !skinTypes.has(skinType)) invalidQuestionnaireFields.push("skinType");

    if (!isNonEmptyArray(answers.concerns)) missingQuestionnaireFields.push("concerns");
    else if (answers.concerns.some((value) => !concerns.has(value))) invalidQuestionnaireFields.push("concerns");

    if (!isNonEmptyArray(answers.goals)) missingQuestionnaireFields.push("goals");
    else if (answers.goals.some((value) => !goals.has(value))) invalidQuestionnaireFields.push("goals");
  }

  const file = photo?.file;
  const hasSelectedFile = Boolean(file && typeof file.size === "number" && typeof file.type === "string");
  const hasValidImageFile = Boolean(
    hasSelectedFile &&
    file &&
    file.size > 0 &&
    file.size <= 10 * 1024 * 1024 &&
    imageTypes.has(file.type.toLowerCase()),
  );

  return {
    hasSelectedFile,
    hasValidImageFile,
    missingQuestionnaireFields,
    invalidQuestionnaireFields,
  };
}

export function analysisInputIsValid(audit: AnalysisInputAudit): boolean {
  return audit.hasValidImageFile &&
    audit.missingQuestionnaireFields.length === 0 &&
    audit.invalidQuestionnaireFields.length === 0;
}
