import { Cormorant_Garamond, Inter } from "next/font/google";

export const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
