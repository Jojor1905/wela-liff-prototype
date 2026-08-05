import type { AnalysisResult, UploadedPhoto } from "@/src/models/wela";
import { PrototypeDisclaimer } from "./PrototypeDisclaimer";

const regionNames: Record<AnalysisResult["dominantRegion"], string> = {
  forehead: "หน้าผาก",
  leftCheek: "แก้มซ้าย",
  rightCheek: "แก้มขวา",
  chin: "คาง",
  nose: "จมูก",
  none: "ไม่พบบริเวณเด่น",
};

const severityLabels: Record<AnalysisResult["severityLevel"], string> = { Low: "เล็กน้อย", Moderate: "ปานกลาง", Elevated: "ค่อนข้างมาก" };
const confidenceLabels: Record<AnalysisResult["confidenceSummary"], string> = { Low: "ต่ำ", Moderate: "ปานกลาง", High: "สูง" };

export function AnalysisSummary({ result, photo }: { result: AnalysisResult; photo: UploadedPhoto | null }) {
  return (
    <>
      <section className="result-hero">
        <div className="result-portrait">
          {photo ? (
            // Browser-created object URLs are intentionally rendered directly and never sent to Next's image optimiser.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.previewUrl} alt="ตัวอย่างรูปภาพที่คุณเลือกบนอุปกรณ์" />
          ) : <div className="portrait-placeholder" aria-label="ภาพบุคคลประกอบสำหรับต้นแบบ"><span /></div>}
        </div>
        <div className="result-score">
          <span>{result.source === "api" ? "ดัชนีจากการตรวจจับ" : "คะแนนผิวต้นแบบ"}</span><strong>{result.skinScore}</strong><small>{result.source === "api" ? "คำนวณจากผลโมเดลของรูปภาพนี้" : "ตัวชี้วัดจำลองสำหรับการทดลอง"}</small>
        </div>
      </section>
      <section className="analysis-summary" aria-labelledby="summary-title">
        <div><p className="screen-kicker">{result.source === "api" ? "ผลจากโมเดล YOLO ทดลองของรูปภาพนี้" : "ผลลัพธ์จำลองของคุณ"}</p><h1 id="summary-title">ภาพรวมผิวที่อ่านง่ายและไม่ตัดสิน</h1></div>
        <dl className="summary-measures">
          <div><dt>จุดที่มองเห็น</dt><dd>{result.lesionCount}</dd></div>
          <div><dt>บริเวณที่พบมากที่สุด</dt><dd>{regionNames[result.dominantRegion]}</dd></div>
          <div><dt>ระดับสิวที่มองเห็น</dt><dd>{severityLabels[result.severityLevel]}</dd></div>
          <div><dt>ระดับความเชื่อมั่น</dt><dd>{confidenceLabels[result.confidenceSummary]}</dd></div>
        </dl>
      </section>
      <PrototypeDisclaimer text={result.disclaimer} />
    </>
  );
}
