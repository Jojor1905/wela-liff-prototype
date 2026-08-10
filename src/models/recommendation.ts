import type { ProductItem } from "./product";
import type { AnalysisResult, UploadedPhoto, UserAnswers } from "./wela";
import type { ConditionMappingResult } from "../rules/condition-mapping";

export const requestedProductCategories = ["cleanser", "serum", "moisturizer", "sunscreen"] as const;
export type RequestedProductCategory = (typeof requestedProductCategories)[number];

export type ProductRecommendationStatus = "idle" | "loading" | "ready" | "empty" | "error";

export interface RecommendationState extends ConditionMappingResult {
  requestId?: string;
  prediction: AnalysisResult | null;
  questionnaire: UserAnswers;
  photo: UploadedPhoto | null;
  products: ProductItem[];
  selectedProductIds: string[];
  productStatus: ProductRecommendationStatus;
  productDisclaimer?: string;
  productError?: string;
}

export const emptyRecommendationState: RecommendationState = {
  conditionIds: [],
  conditions: [],
  visualFindings: [],
  needsClarification: [],
  prediction: null,
  questionnaire: { concerns: [], goals: [] },
  photo: null,
  products: [],
  selectedProductIds: [],
  productStatus: "idle",
};

export function recommendationForNewImage({
  questionnaire = { concerns: [], goals: [] },
  photo = null,
}: {
  questionnaire?: UserAnswers;
  photo?: UploadedPhoto | null;
} = {}): RecommendationState {
  return {
    ...emptyRecommendationState,
    conditionIds: [],
    conditions: [],
    visualFindings: [],
    needsClarification: [],
    prediction: null,
    questionnaire: {
      ...questionnaire,
      concerns: [...questionnaire.concerns],
      goals: [...questionnaire.goals],
    },
    photo,
    products: [],
    selectedProductIds: [],
  };
}

export function toggleRecommendationProduct(state: RecommendationState, productId: string): RecommendationState {
  return {
    ...state,
    selectedProductIds: state.selectedProductIds.includes(productId)
      ? state.selectedProductIds.filter((id) => id !== productId)
      : [...state.selectedProductIds, productId],
  };
}

export function productForCategory(
  products: readonly ProductItem[],
  category: RequestedProductCategory,
): ProductItem | undefined {
  return products.find((product) => product.category === category);
}

export function productsForConditions(
  products: readonly ProductItem[],
  conditionIds: readonly string[],
): ProductItem[] {
  const allowed = new Set(conditionIds);
  if (allowed.size === 0) return [];
  return products.filter((product) => product.condition_ids.some((conditionId) => allowed.has(conditionId)));
}
