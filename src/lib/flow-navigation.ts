export const flowSteps = {
  consent: "consent",
  scanIntroduction: "welcome",
  photoSource: "upload",
  photoReview: "preview",
  beforeQuestionnaire: "intro",
  gender: "gender",
  age: "age",
  skinType: "skin-type",
  concerns: "concerns",
  goals: "goals",
  loading: "loading",
  analysisError: "analysis-error",
  result: "result",
  products: "products",
  productDetail: "product-detail",
} as const;

export type FlowStep = (typeof flowSteps)[keyof typeof flowSteps];

export const questionnaireSteps = [
  flowSteps.gender,
  flowSteps.age,
  flowSteps.skinType,
  flowSteps.concerns,
  flowSteps.goals,
] as const;

export const orderedFlow: readonly FlowStep[] = [
  flowSteps.consent,
  flowSteps.scanIntroduction,
  flowSteps.photoSource,
  flowSteps.photoReview,
  flowSteps.beforeQuestionnaire,
  ...questionnaireSteps,
  flowSteps.loading,
  flowSteps.result,
  flowSteps.products,
  flowSteps.productDetail,
];

export const historySteps: readonly FlowStep[] = [
  ...orderedFlow,
  flowSteps.analysisError,
];

export const progressSteps: readonly FlowStep[] = [
  ...questionnaireSteps,
  flowSteps.result,
  flowSteps.products,
];

export const mainButtonDestinations = {
  consent: flowSteps.scanIntroduction,
  scanIntroduction: flowSteps.photoSource,
  photoReview: flowSteps.beforeQuestionnaire,
  analysisLoading: flowSteps.loading,
  beforeQuestionnaire: flowSteps.gender,
} as const;

const stepsWithoutPhoto: readonly FlowStep[] = [
  flowSteps.consent,
  flowSteps.scanIntroduction,
  flowSteps.photoSource,
];

export function previousFlowStep(step: FlowStep): FlowStep | null {
  const index = orderedFlow.indexOf(step);
  return index > 0 ? orderedFlow[index - 1] : null;
}

export function resolveRestoredStep({
  requestedStep,
  consentAccepted,
  hasPhoto,
}: {
  requestedStep: FlowStep;
  consentAccepted: boolean;
  hasPhoto: boolean;
}): FlowStep {
  if (requestedStep !== flowSteps.consent && !consentAccepted) {
    return flowSteps.consent;
  }

  const canOpenWithoutPhoto = stepsWithoutPhoto.includes(requestedStep);

  return !canOpenWithoutPhoto && !hasPhoto ? flowSteps.photoSource : requestedStep;
}

export function canContinueFromConsent(imageConsentAccepted: boolean, policyAccepted: boolean): boolean {
  return imageConsentAccepted && policyAccepted;
}
