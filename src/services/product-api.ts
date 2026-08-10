import type { ProductResponse } from "../models/product";
import type { ConditionId } from "../rules/condition-mapping";
import type { RequestedProductCategory } from "../models/recommendation";

export interface ProductQuery {
  conditionIds: readonly ConditionId[];
  categories: readonly RequestedProductCategory[];
  limit?: number;
  signal?: AbortSignal;
}

export interface ProductApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export class ProductApiError extends Error {
  constructor(
    public readonly code: "configuration" | "empty-conditions" | "network" | "server" | "invalid-response",
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ProductApiError";
  }
}

function endpointFor(baseUrl: string): URL {
  try {
    const endpoint = new URL("product", `${baseUrl.replace(/\/+$/, "")}/`);
    if (!new Set(["http:", "https:"]).has(endpoint.protocol)) throw new Error("Unsupported protocol");
    return endpoint;
  } catch {
    throw new ProductApiError("configuration", "ยังไม่ได้ตั้งค่าบริการแนะนำผลิตภัณฑ์");
  }
}

function isProductResponse(value: unknown): value is ProductResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<ProductResponse>;
  return (
    typeof response.count === "number" &&
    Array.isArray(response.matched_condition_ids) &&
    Array.isArray(response.items) &&
    response.items.every((item) => (
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.category === "string" &&
      typeof item.reason === "string" &&
      Array.isArray(item.condition_ids) &&
      Array.isArray(item.condition_names_th) &&
      Array.isArray(item.source_pages) &&
      (typeof item.image_url === "string" || item.image_url === null)
    )) &&
    typeof response.disclaimer === "string"
  );
}

export function createProductApiClient({ baseUrl, fetchImpl = fetch }: ProductApiClientOptions) {
  const endpoint = endpointFor(baseUrl);

  return {
    async recommend({ conditionIds, categories, limit = 12, signal }: ProductQuery): Promise<ProductResponse> {
      if (conditionIds.length === 0) {
        throw new ProductApiError("empty-conditions", "ยังไม่มีข้อมูลเพียงพอสำหรับค้นหาผลิตภัณฑ์");
      }

      let response: Response;
      try {
        response = await fetchImpl(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            condition_ids: conditionIds,
            categories,
            limit,
          }),
          cache: "no-store",
          signal,
        });
      } catch (error) {
        if (signal?.aborted) throw error;
        throw new ProductApiError("network", "ไม่สามารถเชื่อมต่อบริการแนะนำผลิตภัณฑ์ได้");
      }

      if (!response.ok) {
        throw new ProductApiError("server", "บริการแนะนำผลิตภัณฑ์ไม่สามารถประมวลผลคำขอได้", response.status);
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new ProductApiError("invalid-response", "บริการแนะนำผลิตภัณฑ์ส่งข้อมูลที่อ่านไม่ได้", response.status);
      }
      if (!isProductResponse(payload)) {
        throw new ProductApiError("invalid-response", "บริการแนะนำผลิตภัณฑ์ส่งข้อมูลไม่ครบถ้วน", response.status);
      }
      return payload;
    },
  };
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export async function fetchRecommendedProducts(query: ProductQuery): Promise<ProductResponse> {
  if (!apiBaseUrl) throw new ProductApiError("configuration", "ยังไม่ได้ตั้งค่าบริการแนะนำผลิตภัณฑ์");
  return createProductApiClient({ baseUrl: apiBaseUrl }).recommend(query);
}
