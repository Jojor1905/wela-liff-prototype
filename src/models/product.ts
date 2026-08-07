export interface ProductItem {
  id: string;
  name: string;
  category: string;
  reason: string;
  condition_ids: string[];
  condition_names_th: string[];
  source_pages: number[];
  image_url: string | null;
}

export interface ProductResponse {
  count: number;
  matched_condition_ids: string[];
  items: ProductItem[];
  disclaimer: string;
}