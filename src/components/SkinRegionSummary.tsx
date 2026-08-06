import type { AnalysisResult } from "@/src/models/wela";

const regions: { key: keyof AnalysisResult["regionCounts"]; label: string }[] = [
  { key: "forehead", label: "หน้าผาก" },
  { key: "leftCheek", label: "แก้มซ้าย" },
  { key: "rightCheek", label: "แก้มขวา" },
  { key: "chin", label: "คาง" },
  { key: "nose", label: "จมูก" },
];

export function SkinRegionSummary({ result }: { result: AnalysisResult }) {
  if (result.source !== "api") {
    return (
      <section className="region-summary" aria-labelledby="region-title">
        <div className="section-heading"><span>หลักฐานจากภาพ</span><h2 id="region-title">ไม่มีผลตรวจจับจากโมเดลในโหมดจำลอง</h2></div>
        <p className="questionnaire-note">ตัวเลขจากข้อมูลจำลองจะไม่ถูกนำมาแสดงเป็นผลตรวจจับจริง</p>
      </section>
    );
  }
  return (
    <section className="region-summary" aria-labelledby="region-title">
      <div className="section-heading"><span>หลักฐานจากโมเดล · acne_lesion เท่านั้น</span><h2 id="region-title">การกระจายของจุดที่โมเดลทำเครื่องหมาย</h2></div>
      <div className="region-bars">
        {regions.map(({ key, label }) => (
          <div className="region-bar" key={key}>
            <div><span>{label}</span><strong>{result.regionCounts[key]}</strong></div>
            <span className="region-bar__track"><i style={{ width: `${result.regionCounts[key] === 0 ? 0 : Math.min(100, result.regionCounts[key] * 30)}%` }} /></span>
          </div>
        ))}
      </div>
      <p className="questionnaire-note"><strong>ขอบเขตของโมเดล</strong> โมเดลไม่ได้ระบุความมัน ความแห้ง ภาวะขาดน้ำ ความไวต่อการระคายเคือง เม็ดสี หรือริ้วรอย</p>
    </section>
  );
}
