import { ProductResponse } from "@/src/models/product";

const API_URL = "https://wela-skin-ai-api.onrender.com/product";

export async function getProducts(search = ""): Promise<ProductResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      search,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}