import type { AnalysisResult, UserAnswers } from "@/src/models/wela";

const mockResult: AnalysisResult = {
  source: "mock",
  lesionCount: 7,
  dominantRegion: "rightCheek",
  confidenceSummary: "Moderate",
  severityLevel: "Low",
  skinScore: 82,
  detections: [
    { className: "acne_lesion", confidence: 0.79, region: "rightCheek" },
    { className: "acne_lesion", confidence: 0.74, region: "leftCheek" },
    { className: "acne_lesion", confidence: 0.72, region: "chin" },
  ],
  regionCounts: { forehead: 1, leftCheek: 2, rightCheek: 3, chin: 1, nose: 0 },
  insights: [
    "ผลภาพจำลองพบจุดที่มองเห็นส่วนใหญ่อยู่บริเวณแก้มขวา",
    "ลักษณะผิวและความกังวลอื่น ๆ มาจากคำตอบในแบบสอบถามของคุณ",
  ],
  questionnaireInsights: [
    "ลักษณะผิวและความกังวลด้านผิวที่คุณระบุช่วยกำหนดหมวดหมู่ผลิตภัณฑ์ในกิจวัตรจำลองนี้",
    "คำตอบในแบบสอบถามจะไม่ถูกตีความว่าเป็นภาวะที่ตรวจพบจากภาพ",
  ],
  recommendations: [
    "รักษากิจวัตรให้กระชับและเริ่มใช้ผลิตภัณฑ์ใหม่ทีละรายการ",
    "ใช้ผลิตภัณฑ์ทำความสะอาดสูตรอ่อนโยน เซรั่มเนื้อบางเบา มอยส์เจอไรเซอร์ และครีมกันแดดทุกวัน",
  ],
  productRecommendations: [
    {
      category: "ผลิตภัณฑ์ทำความสะอาด",
      focus: "ผลิตภัณฑ์ทำความสะอาดสูตรอ่อนโยนสำหรับทุกวัน",
      rationale: "คัดเลือกจากลักษณะผิวและเป้าหมายกิจวัตรที่คุณระบุ",
    },
    {
      category: "ครีมกันแดด",
      focus: "ครีมกันแดดชนิดครอบคลุมสำหรับทุกวัน",
      rationale: "เป็นหมวดหมู่ทั่วไปสำหรับกิจวัตรด้านความงาม โดยไม่มีคำกล่าวอ้างด้านการรักษา",
    },
  ],
  disclaimer:
    "การวิเคราะห์ภาพนี้เป็นการทดลองเพื่อสาธิตต้นแบบเท่านั้น ผลลัพธ์อาจไม่ครบถ้วนหรือคลาดเคลื่อน และไม่ใช่การวินิจฉัยทางการแพทย์",
};

export async function runMockAnalysis(
  answers: UserAnswers,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  void answers;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 1200);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("The request was cancelled.", "AbortError"));
      },
      { once: true },
    );
  });
  return structuredClone(mockResult);
}
