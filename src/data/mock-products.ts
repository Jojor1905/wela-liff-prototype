import type { ProductRecommendation } from "@/src/models/wela";

export const mockProducts: ProductRecommendation[] = [
  {
    id: "quiet-cleanse",
    name: "Quiet Cleanse",
    category: "ผลิตภัณฑ์ทำความสะอาดผิวสูตรอ่อนโยน",
    role: "ขั้นตอนแรกที่เรียบง่าย ช่วยชำระสิ่งตกค้างในแต่ละวันโดยไม่ทำให้กิจวัตรซับซ้อน",
    usage: "เช้าและเย็น · 45 วินาที",
    price: 890,
    priority: "Essential",
    tone: "ivory",
  },
  {
    id: "balance-serum",
    name: "Balance Serum",
    category: "เซรั่มเนื้อบางเบา",
    role: "คัดเลือกตามเป้าหมายเรื่องสิวที่มองเห็นและความต้องการกิจวัตรที่สงบและกระชับ",
    usage: "ตอนเย็น · 2–3 หยด",
    price: 1490,
    priority: "Essential",
    tone: "blush",
  },
  {
    id: "daily-veil",
    name: "Daily Veil SPF 40",
    category: "ครีมกันแดดสำหรับทุกวัน",
    role: "ขั้นตอนสุดท้ายในตอนเช้าที่สบายผิวและเหมาะกับกิจวัตรการดูแลผิวประจำวัน",
    usage: "ตอนเช้า · ทาซ้ำตามความเหมาะสม",
    price: 1150,
    priority: "Essential",
    tone: "burgundy",
  },
];
