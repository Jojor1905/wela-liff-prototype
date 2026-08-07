import assert from "node:assert/strict";
import test from "node:test";
import {
  canContinueFromConsent,
  flowSteps,
  mainButtonDestinations,
  orderedFlow,
  previousFlowStep,
  resolveRestoredStep,
} from "../src/lib/flow-navigation";
import {
  photoEntrySequence,
  photoFlowSteps,
  releaseUploadedPhoto,
  replaceUploadedPhoto,
  reviewStepFor,
  verifyPhotoDecodes,
} from "../src/lib/photo-flow";
import type { UploadedPhoto } from "../src/models/wela";

function imageFile(name: string): File {
  return new File([new Uint8Array([137, 80, 78, 71])], name, { type: "image/png" });
}

function objectUrlHarness() {
  const created: File[] = [];
  const revoked: string[] = [];
  return {
    created,
    revoked,
    api: {
      createObjectURL(file: Blob) {
        created.push(file as File);
        return `blob:test-${created.length}`;
      },
      revokeObjectURL(url: string) {
        revoked.push(url);
      },
    },
  };
}

test("scan introduction continues to the existing photo source step", () => {
  assert.equal(flowSteps.photoSource, "upload");
  assert.deepEqual(orderedFlow.slice(0, 3), ["consent", "welcome", "upload"]);
});

test("photo source Back returns to scan introduction without a preparation step", () => {
  assert.equal(previousFlowStep(flowSteps.photoSource), flowSteps.scanIntroduction);
  assert.deepEqual(photoEntrySequence, ["welcome", "upload", "preview", "intro"]);
});

test("privacy consent is first and the required acknowledgement gates scan introduction", () => {
  assert.equal(orderedFlow[0], flowSteps.consent);
  assert.equal(canContinueFromConsent(false, false), false);
  assert.equal(canContinueFromConsent(true, false), false);
  assert.equal(canContinueFromConsent(false, true), false);
  assert.equal(canContinueFromConsent(true, true), true);
  assert.equal(mainButtonDestinations.consent, flowSteps.scanIntroduction);
  assert.equal(previousFlowStep(flowSteps.scanIntroduction), flowSteps.consent);
});

test("the reordered entry flow has predictable forward and Back destinations", () => {
  const entry = orderedFlow.slice(0, 6);
  assert.deepEqual(entry, ["consent", "welcome", "upload", "preview", "intro", "gender"]);
  assert.equal(mainButtonDestinations.scanIntroduction, flowSteps.photoSource);
  assert.equal(mainButtonDestinations.photoReview, flowSteps.beforeQuestionnaire);
  assert.equal(mainButtonDestinations.beforeQuestionnaire, flowSteps.gender);
  assert.equal(previousFlowStep(flowSteps.photoReview), flowSteps.photoSource);
  assert.equal(previousFlowStep(flowSteps.beforeQuestionnaire), flowSteps.photoReview);
  assert.equal(previousFlowStep(flowSteps.gender), flowSteps.beforeQuestionnaire);
});

test("photo review immediate analysis opens the existing loading step", () => {
  assert.equal(mainButtonDestinations.analysisLoading, flowSteps.loading);
});

test("gallery and camera selections both continue to photo review with the original File", () => {
  for (const source of ["library", "camera"] as const) {
    const urls = objectUrlHarness();
    const file = imageFile(`${source}.png`);
    const photo = replaceUploadedPhoto(null, file, source, urls.api);

    assert.equal(reviewStepFor(photo), photoFlowSteps.review);
    assert.equal(photo.file, file);
    assert.equal(photo.source, source);
    assert.equal(photo.previewUrl, "blob:test-1");
    assert.deepEqual(urls.created, [file]);
  }
});

test("photo review has no fallback portrait when the selected photo is missing", () => {
  assert.equal(reviewStepFor(null), photoFlowSteps.source);
});

test("photo review continues through before-questionnaire without replacing the File", () => {
  const urls = objectUrlHarness();
  const file = imageFile("questionnaire.png");
  const photo = replaceUploadedPhoto(null, file, "library", urls.api);

  assert.equal(photoFlowSteps.beforeQuestionnaire, "intro");
  assert.equal(previousFlowStep(flowSteps.gender), flowSteps.beforeQuestionnaire);
  assert.equal(photo.file, file);
});

test("the selected File remains available across the reordered questionnaire path", () => {
  const urls = objectUrlHarness();
  const file = imageFile("preserved-through-questionnaire.png");
  const photo = replaceUploadedPhoto(null, file, "library", urls.api);
  const questionnairePath = orderedFlow.slice(
    orderedFlow.indexOf(flowSteps.photoReview),
    orderedFlow.indexOf(flowSteps.loading) + 1,
  );

  assert.deepEqual(questionnairePath, ["preview", "intro", "gender", "age", "skin-type", "concerns", "goals", "loading"]);
  assert.equal(photo.file, file);
});

test("navigation guards require consent and recover missing photo state safely", () => {
  assert.equal(resolveRestoredStep({ requestedStep: flowSteps.photoReview, consentAccepted: false, hasPhoto: true }), flowSteps.consent);
  assert.equal(resolveRestoredStep({ requestedStep: flowSteps.gender, consentAccepted: true, hasPhoto: false }), flowSteps.photoSource);
  assert.equal(resolveRestoredStep({ requestedStep: flowSteps.gender, consentAccepted: true, hasPhoto: true }), flowSteps.gender);
});

test("questionnaire and post-analysis ordering remains unchanged", () => {
  assert.deepEqual(orderedFlow.slice(5), ["gender", "age", "skin-type", "concerns", "goals", "loading", "result", "products", "product-detail"]);
});

test("replacing a photo revokes the obsolete preview and creates a preview for the new File", () => {
  const urls = objectUrlHarness();
  const first = replaceUploadedPhoto(null, imageFile("first.png"), "library", urls.api);
  const secondFile = imageFile("second.png");
  const second = replaceUploadedPhoto(first, secondFile, "camera", urls.api);

  assert.deepEqual(urls.revoked, [first.previewUrl]);
  assert.equal(second.file, secondFile);
  assert.equal(second.previewUrl, "blob:test-2");
});

test("temporary decode URLs and final preview URLs are revoked appropriately", async () => {
  const urls = objectUrlHarness();
  const file = imageFile("decode.png");

  await verifyPhotoDecodes(file, async (previewUrl) => {
    assert.equal(previewUrl, "blob:test-1");
  }, urls.api);
  const photo: UploadedPhoto = replaceUploadedPhoto(null, file, "library", urls.api);
  releaseUploadedPhoto(photo, urls.api);

  assert.deepEqual(urls.revoked, ["blob:test-1", "blob:test-2"]);
});

test("a failed decode still revokes its temporary object URL", async () => {
  const urls = objectUrlHarness();
  await assert.rejects(
    verifyPhotoDecodes(imageFile("broken.png"), async () => { throw new Error("decode failed"); }, urls.api),
    /decode failed/,
  );
  assert.deepEqual(urls.revoked, ["blob:test-1"]);
});
