import type { ProductRecommendation } from "@/src/models/wela";

export const mockProducts: ProductRecommendation[] = [
  {
    id: "quiet-cleanse",
    name: "Quiet Cleanse",
    category: "Gentle cleanser",
    role: "A simple first step to remove daily build-up without overcomplicating your routine.",
    usage: "Morning and evening · 45 seconds",
    price: 890,
    priority: "Essential",
    tone: "ivory",
  },
  {
    id: "balance-serum",
    name: "Balance Serum",
    category: "Lightweight serum",
    role: "Selected for your visible-breakout goal and preference for a calm, concise routine.",
    usage: "Evening · 2–3 drops",
    price: 1490,
    priority: "Essential",
    tone: "blush",
  },
  {
    id: "daily-veil",
    name: "Daily Veil SPF 40",
    category: "Daily sunscreen",
    role: "A comfortable final morning step that supports an everyday skincare routine.",
    usage: "Morning · Reapply as appropriate",
    price: 1150,
    priority: "Essential",
    tone: "burgundy",
  },
];
