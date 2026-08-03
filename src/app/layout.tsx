import type { Metadata } from "next";
import { LiffProvider } from "@/src/components/LiffProvider";
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
      <body>
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}
