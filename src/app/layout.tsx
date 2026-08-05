import type { Metadata } from "next";
import { LiffProvider } from "@/src/components/LiffProvider";
import { displayFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wela — แบบประเมินการดูแลผิวส่วนตัว",
  description:
    "ต้นแบบแบบประเมินการดูแลผิวส่วนตัว พร้อมผลลัพธ์จำลองและคำแนะนำผลิตภัณฑ์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={displayFont.variable} lang="th">
      <body>
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}
