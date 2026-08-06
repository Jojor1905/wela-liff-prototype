import type { AnalysisResult, UploadedPhoto } from "@/src/models/wela";
import type { SkinRecommendationResult } from "@/src/types/skin-rules";
import { PrototypeDisclaimer } from "./PrototypeDisclaimer";

const regionNames: Record<AnalysisResult["dominantRegion"], string> = {
  forehead: "หน้าผาก",
  leftCheek: "แก้มซ้าย",
  rightCheek: "แก้มขวา",
  chin: "คาง",
  nose: "จมูก",
  none: "ไม่พบบริเวณเด่น",
};

const sourceLabels = { model: "จากโมเดล", questionnaire: "จากแบบสอบถาม", combined: "ข้อมูลร่วม" } as const;

export function AnalysisSummary({ result, recommendation, photo }: { result: AnalysisResult; recommendation: SkinRecommendationResult; photo: UploadedPhoto | null }) {
  const modelFinding = recommendation.visualFindings[0];
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
          <span>ความกังวลหลัก</span>
          <strong className="result-score__condition">{recommendation.primaryCondition?.displayNameTh ?? "ต้องการข้อมูลเพิ่ม"}</strong>
          <small>{recommendation.primaryCondition ? sourceLabels[recommendation.primaryCondition.source] : "ระบบจะไม่คาดเดาจากข้อมูลที่ไม่เพียงพอ"}</small>
        </div>
      </section>
      <section className="analysis-summary" aria-labelledby="summary-title">
        <div><p className="screen-kicker">ผลลัพธ์ตามหลักฐาน</p><h1 id="summary-title">ภาพรวมผิวและกิจวัตรที่อธิบายที่มาได้</h1></div>
        <dl className="summary-measures">
          <div><dt>จุด acne_lesion จากโมเดล</dt><dd>{result.source === "api" ? result.lesionCount : "ไม่มีผลโมเดล"}</dd></div>
          <div><dt>บริเวณเด่นจากโมเดล</dt><dd>{result.source === "api" ? regionNames[result.dominantRegion] : "ไม่มีผลโมเดล"}</dd></div>
          <div><dt>ความกังวลรอง</dt><dd>{recommendation.secondaryConditions.map((condition) => condition.displayNameTh).join(" · ") || "ไม่มี"}</dd></div>
          <div><dt>ที่มาของผลภาพ</dt><dd>{modelFinding ? sourceLabels[modelFinding.source] : "ไม่พบหลักฐานจากภาพ"}</dd></div>
        </dl>
      </section>
      <PrototypeDisclaimer text={recommendation.disclaimer} />
    </>
  );
}
