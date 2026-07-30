import type { Metadata } from "next";
import { bodyFont, displayFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wela — Personalised Skin Consultation",
  description:
    "A premium skincare consultation prototype offering personalised routines and product guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${bodyFont.variable} ${displayFont.variable}`}
      lang="en-GB"
    >
      <body>{children}</body>
    </html>
  );
}
