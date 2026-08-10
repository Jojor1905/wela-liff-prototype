import assert from "node:assert/strict";
import test from "node:test";
import { analysisInputIsValid, auditAnalysisInput, requiredQuestionnaireFields } from "../src/lib/analysis-validation";
import { recommendationForNewImage } from "../src/models/recommendation";
import type { UploadedPhoto, UserAnswers } from "../src/models/wela";

const completedAnswers: UserAnswers = {
  gender: "woman",
  ageRange: "30–39",
  skinType: "oily",
  concerns: ["visible-breakouts", "dark-spots"],
  goals: ["simpler-routine"],
};

const selectedFile = new File([new Uint8Array([137, 80, 78, 71])], "selected.png", { type: "image/png" });
const photo: UploadedPhoto = {
  file: selectedFile,
  previewUrl: "blob:selected-photo",
  source: "library",
};

test("all five current questionnaire answers and a selected image pass validation", () => {
  const audit = auditAnalysisInput(completedAnswers, photo);

  assert.equal(analysisInputIsValid(audit), true);
  assert.equal(audit.hasSelectedFile, true);
  assert.deepEqual(audit.missingQuestionnaireFields, []);
  assert.deepEqual(audit.invalidQuestionnaireFields, []);
});

test("only the five currently visible questionnaire fields are required", () => {
  assert.deepEqual(requiredQuestionnaireFields, ["gender", "ageRange", "skinType", "concerns", "goals"]);
  assert.equal(requiredQuestionnaireFields.includes("sensitivity" as never), false);
  assert.equal(requiredQuestionnaireFields.includes("dehydration" as never), false);
});

test("a genuinely unanswered current question fails with the exact state key", () => {
  const audit = auditAnalysisInput({ ...completedAnswers, goals: [] }, photo);

  assert.equal(analysisInputIsValid(audit), false);
  assert.deepEqual(audit.missingQuestionnaireFields, ["goals"]);
});

test("questionnaire and the original selected File survive recommendation-state updates", () => {
  const state = recommendationForNewImage({ questionnaire: completedAnswers, photo });
  const updated = {
    ...state,
    questionnaire: { ...state.questionnaire, goals: ["comfortable-hydration"] as UserAnswers["goals"] },
  };

  assert.equal(updated.photo?.file, selectedFile);
  assert.equal(updated.photo?.previewUrl, photo.previewUrl);
  assert.equal(updated.questionnaire.gender, "woman");
  assert.equal(updated.questionnaire.skinType, "oily");
});

test("the immediate image-only route still validates the real selected File without inventing answers", () => {
  const audit = auditAnalysisInput({ concerns: [], goals: [] }, photo, { questionnaireRequired: false });

  assert.equal(analysisInputIsValid(audit), true);
  assert.equal(audit.hasSelectedFile, true);
  assert.deepEqual(audit.missingQuestionnaireFields, []);
});
