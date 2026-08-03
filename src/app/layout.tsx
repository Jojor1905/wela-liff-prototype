import type { Metadata } from "next";
import { bodyFont, displayFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wela — Private Skincare Consultation",
  description:
    "A private skincare consultation prototype with simulated results and product guidance.",
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
