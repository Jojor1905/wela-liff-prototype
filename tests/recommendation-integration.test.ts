import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { productForCategory, productsForConditions, recommendationForNewImage, requestedProductCategories, toggleRecommendationProduct, type RecommendationState } from "../src/models/recommendation";
import type { ProductItem, ProductResponse } from "../src/models/product";
import type { AnalysisResult, UserAnswers } from "../src/models/wela";
import { ageRangeConditionMap, concernConditionMap, deriveConditionMapping, genderConditionMap, goalConditionMap, skinTypeConditionMap } from "../src/rules/condition-mapping";
import { createProductApiClient, ProductApiError } from "../src/services/product-api";

const modelResult: AnalysisResult = {
  source: "api",
  provenance: {
    requestId: "request-current",
    inputSha256Prefix: "a1b2c3d4e5f6",
    inferenceExecuted: true,
    rawDetectionCount: 2,
    postThresholdDetectionCount: 1,
  },
  lesionCount: 1,
  dominantRegion: "rightCheek",
  confidenceSummary: "Moderate",
  severityLevel: "Low",
  skinScore: 90,
  detections: [{ className: "acne_lesion", confidence: 0.67, region: "rightCheek" }],
  regionCounts: { forehead: 0, leftCheek: 0, rightCheek: 1, chin: 0, nose: 0 },
  insights: [],
  questionnaireInsights: [],
  recommendations: [],
  productRecommendations: [],
  disclaimer: "Prototype only",
};

const serum: ProductItem = {
  id: "product-serum",
  name: "Catalog Serum",
  category: "serum",
  reason: "เหตุผลจากแค็ตตาล็อก",
  condition_ids: ["oily_skin"],
  condition_names_th: ["ผิวมัน"],
  source_pages: [1, 5],
  image_url: null,
};

const productResponse: ProductResponse = {
  count: 1,
  matched_condition_ids: ["oily_skin"],
  items: [serum],
  disclaimer: "ต้นแบบเชิงวิชาการ",
};

test("every current questionnaire option has an explicit condition coverage decision", () => {
  assert.deepEqual(genderConditionMap, {
    woman: null,
    man: null,
    "non-binary": null,
  });
  assert.deepEqual(ageRangeConditionMap, {
    "18–29": null,
    "30–39": null,
    "40–49": null,
    "50+": null,
  });
  assert.deepEqual(skinTypeConditionMap, {
    balanced: null,
    dry: "dry_skin",
    oily: "oily_skin",
    combination: null,
    sensitive: "sensitive_skin",
  });
  assert.deepEqual(
    Object.fromEntries([
      "visible-breakouts",
      "dark-spots",
      "wrinkles",
      "large-pores",
      "dullness",
      "melasma-freckles",
      "uneven-looking-tone",
      "dry-flaking",
    ].map((value) => [value, concernConditionMap[value as keyof typeof concernConditionMap]])),
    {
      "visible-breakouts": null,
      "dark-spots": "pigmentation_dark_spots",
      wrinkles: "fine_lines_wrinkles",
      "large-pores": null,
      dullness: "dull_skin",
      "melasma-freckles": "pigmentation_dark_spots",
      "uneven-looking-tone": null,
      "dry-flaking": "dry_skin",
    },
  );
  assert.deepEqual(goalConditionMap, {
    "calmer-looking-skin": null,
    "comfortable-hydration": null,
    "more-even-looking-tone": null,
    "simpler-routine": null,
  });
});

test("every current skin-type and concern option derives only its audited condition", () => {
  for (const [skinType, expected] of Object.entries(skinTypeConditionMap)) {
    const result = deriveConditionMapping(null, {
      skinType: skinType as UserAnswers["skinType"],
      concerns: [],
      goals: [],
    });
    assert.deepEqual(result.conditionIds, expected ? [expected] : []);
  }

  const currentConcernValues = [
    "visible-breakouts",
    "dark-spots",
    "wrinkles",
    "large-pores",
    "dullness",
    "melasma-freckles",
    "uneven-looking-tone",
    "dry-flaking",
  ] as const;
  for (const concern of currentConcernValues) {
    const result = deriveConditionMapping(null, { concerns: [concern], goals: [] });
    const expected = concernConditionMap[concern];
    assert.deepEqual(result.conditionIds, expected ? [expected] : []);
  }
});

test("questionnaire values map deterministically while model evidence stays separate", () => {
  const questionnaire: UserAnswers = {
    gender: "woman",
    ageRange: "30–39",
    skinType: "oily",
    concerns: ["dark-spots", "visible-breakouts"],
    goals: ["simpler-routine"],
  };

  const first = deriveConditionMapping(modelResult, questionnaire);
  const second = deriveConditionMapping(modelResult, questionnaire);

  assert.deepEqual(first.conditionIds, ["oily_skin", "pigmentation_dark_spots"]);
  assert.deepEqual(second.conditionIds, first.conditionIds);
  assert.equal(first.conditions.every((condition) => condition.source === "questionnaire"), true);
  assert.equal(first.visualFindings[0].id, "acne_lesion");
  assert.equal(first.visualFindings[0].count, 1);
  assert.equal(first.conditionIds.includes("inflammatory_acne"), false);
  assert.equal(first.conditionIds.includes("comedones"), false);
});

test("sensitive questionnaire value survives into the product condition mapping", () => {
  const mapping = deriveConditionMapping(null, {
    skinType: "sensitive",
    concerns: [],
    goals: [],
  });

  assert.deepEqual(mapping.conditionIds, ["sensitive_skin"]);
  assert.match(mapping.conditions[0].supportingEvidence[0], /ผิวแพ้ง่าย/);
});

test("dehydration and acne subtypes are not guessed from broad goals or model acne", () => {
  const mapping = deriveConditionMapping(modelResult, {
    skinType: "balanced",
    concerns: ["visible-breakouts"],
    goals: ["comfortable-hydration"],
  });

  assert.equal(mapping.conditionIds.includes("dehydrated_skin"), false);
  assert.equal(mapping.conditionIds.includes("comedones"), false);
  assert.equal(mapping.conditionIds.includes("inflammatory_acne"), false);
  assert.ok(mapping.needsClarification.length > 0);
});

test("Product API receives current condition IDs as POST JSON without a face image", async () => {
  let requestInput: string | URL | Request | undefined;
  let requestInit: RequestInit | undefined;
  const fetchMock = (async (input: string | URL | Request, init?: RequestInit) => {
    requestInput = input;
    requestInit = init;
    return new Response(JSON.stringify(productResponse), { status: 200 });
  }) as typeof fetch;
  const client = createProductApiClient({ baseUrl: "http://127.0.0.1:8000/", fetchImpl: fetchMock });

  const result = await client.recommend({
    conditionIds: ["oily_skin"],
    categories: requestedProductCategories,
    limit: 12,
  });

  const body = JSON.parse(String(requestInit?.body)) as Record<string, unknown>;
  assert.equal(String(requestInput), "http://127.0.0.1:8000/product");
  assert.equal(requestInit?.method, "POST");
  assert.equal(new Headers(requestInit?.headers).get("content-type"), "application/json");
  assert.deepEqual(body, {
    condition_ids: ["oily_skin"],
    categories: ["cleanser", "serum", "moisturizer", "sunscreen"],
    limit: 12,
  });
  assert.equal("image" in body, false);
  assert.equal(requestInit?.body instanceof FormData, false);
  assert.deepEqual(result.items, [serum]);
});

test("Product API is not called without a condition ID", async () => {
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return new Response(JSON.stringify(productResponse), { status: 200 });
  }) as typeof fetch;
  const client = createProductApiClient({ baseUrl: "http://127.0.0.1:8000", fetchImpl: fetchMock });

  await assert.rejects(
    client.recommend({ conditionIds: [], categories: requestedProductCategories }),
    (error: unknown) => error instanceof ProductApiError && error.code === "empty-conditions",
  );
  assert.equal(calls, 0);
});

test("missing API categories stay empty rather than becoming fabricated products", () => {
  assert.equal(productForCategory([serum], "serum"), serum);
  assert.equal(productForCategory([serum], "cleanser"), undefined);
  assert.equal(productForCategory([serum], "sunscreen"), undefined);
  assert.equal("price" in serum, false);
});

test("a dry-skin result excludes products that belong only to oily skin", () => {
  const dryProduct: ProductItem = {
    ...serum,
    id: "product-dry",
    name: "Dry Catalog Serum",
    condition_ids: ["dry_skin"],
    condition_names_th: ["ผิวแห้ง"],
  };
  const oilyProduct: ProductItem = {
    ...serum,
    id: "product-oily",
    name: "Oily Catalog Serum",
    condition_ids: ["oily_skin"],
    condition_names_th: ["ผิวมัน"],
  };

  assert.deepEqual(productsForConditions([dryProduct, oilyProduct], ["dry_skin"]), [dryProduct]);
  assert.deepEqual(productsForConditions([dryProduct, oilyProduct], []), []);
});

test("product selection reuses the current Product API objects", () => {
  const state: RecommendationState = {
    ...recommendationForNewImage(),
    questionnaire: { skinType: "oily", concerns: [], goals: [] },
    conditionIds: ["oily_skin"],
    products: [serum],
    productStatus: "ready",
  };

  const selected = toggleRecommendationProduct(state, serum.id);

  assert.equal(selected.products, state.products);
  assert.equal(selected.prediction, state.prediction);
  assert.equal(selected.questionnaire.skinType, "oily");
  assert.deepEqual(selected.selectedProductIds, [serum.id]);
});

test("a new image clears prior conditions, products and selections", () => {
  const cleared = recommendationForNewImage();
  assert.deepEqual(cleared.conditionIds, []);
  assert.deepEqual(cleared.products, []);
  assert.deepEqual(cleared.selectedProductIds, []);
  assert.equal(cleared.requestId, undefined);
  assert.equal(cleared.prediction, null);
  assert.equal(cleared.photo, null);
});

test("recommendation and /products use the shared ProductResponse without a second catalog request", () => {
  const flowSource = readFileSync("src/components/WelaFlow.tsx", "utf8");
  const productsSource = readFileSync("src/components/ProductsList.tsx", "utf8");

  assert.match(flowSource, /router\.push\("\/products"\)/);
  assert.match(productsSource, /useRecommendation\(\)/);
  assert.equal(productsSource.includes("fetchRecommendedProducts"), false);
  assert.equal(productsSource.includes("fetch("), false);
});

test("the real product flow no longer imports or renders the retired mock catalogue", () => {
  const flowSource = readFileSync("src/components/WelaFlow.tsx", "utf8");
  const sectionSource = readFileSync("src/components/ProductSection.tsx", "utf8");
  const cardSource = readFileSync("src/components/ProductCard.tsx", "utf8");
  const combined = `${flowSource}\n${sectionSource}\n${cardSource}`;

  for (const retiredValue of ["Quiet Cleanse", "Balance Serum", "Daily Veil SPF 40", "฿890", "฿1,490", "฿1,150", "ผลิตภัณฑ์จำลอง"]) {
    assert.equal(combined.includes(retiredValue), false);
  }
});
