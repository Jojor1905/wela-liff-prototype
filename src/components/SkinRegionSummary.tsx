import type { AnalysisResult } from "@/src/models/wela";

const regions: { key: keyof AnalysisResult["regionCounts"]; label: string }[] = [
  { key: "forehead", label: "หน้าผาก" },
  { key: "leftCheek", label: "แก้มซ้าย" },
  { key: "rightCheek", label: "แก้มขวา" },
  { key: "chin", label: "คาง" },
  { key: "nose", label: "จมูก" },
];

export function SkinRegionSummary({ result }: { result: AnalysisResult }) {
  return (
    <section className="region-summary" aria-labelledby="region-title">
      <div className="section-heading"><span>{result.source === "api" ? "ผล acne_lesion จากโมเดลทดลอง" : "ผล acne_lesion แบบจำลอง"}</span><h2 id="region-title">การกระจายของจุดที่มองเห็น</h2></div>
      <div className="region-bars">
        {regions.map(({ key, label }) => (
          <div className="region-bar" key={key}>
            <div><span>{label}</span><strong>{result.regionCounts[key]}</strong></div>
            <span className="region-bar__track"><i style={{ width: `${result.regionCounts[key] === 0 ? 0 : Math.min(100, result.regionCounts[key] * 30)}%` }} /></span>
          </div>
        ))}
      </div>
      <p className="questionnaire-note"><strong>บริบทจากแบบสอบถาม</strong> ลักษณะผิว ความกังวล และเป้าหมายของคุณมาจากคำตอบที่เลือกเท่านั้น ไม่ได้อนุมานจากการวิเคราะห์ภาพ</p>
    </section>
  );
}
