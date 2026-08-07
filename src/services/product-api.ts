export type ProductQuery = {
  condition_ids?: string[];
  categories?: string[];
  search?: string;
  limit?: number;
};

export type ProductItem = {
  id: string;
  name: string;
  category: string;
  reason: string;
  condition_ids: string[];
  condition_names_th: string[];
  source_pages: number[];
  image_url: string | null;
};

export type ProductResponse = {
  count: number;
  matched_condition_ids: string[];
  items: ProductItem[];
  disclaimer: string;
};

export async function fetchProducts(
  query: ProductQuery,
): Promise<ProductResponse> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!apiBaseUrl) {
    throw new Error("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_API_BASE_URL");
  }

  const response = await fetch(`${apiBaseUrl}/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Product API failed (${response.status}): ${message}`,
    );
  }

  return (await response.json()) as ProductResponse;
}