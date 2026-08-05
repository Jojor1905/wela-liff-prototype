import Image from "next/image";
import type { AnalysisPhase } from "@/src/models/wela";

const phaseCopy: Record<AnalysisPhase, string> = {
  connecting: "กำลังเชื่อมต่อบริการวิเคราะห์",
  preparing: "กำลังเตรียมโมเดล",
  uploading: "กำลังอัปโหลดรูปภาพ",
  analysing: "กำลังวิเคราะห์สภาพผิว",
  finalising: "กำลังจัดเตรียมผลลัพธ์",
};

export function AnalysisLoading({ phase, mode }: { phase: AnalysisPhase; mode: "api" | "mock" }) {
  const status = mode === "mock" ? "กำลังจัดเตรียมผลลัพธ์จำลอง" : phaseCopy[phase];
  return (
    <section className="loading-screen" aria-live="polite" aria-labelledby="loading-title">
      <Image className="loading-screen__background" src="/images/backgrounds/loading-bg.png" alt="" fill sizes="(max-width: 480px) 100vw, 480px" loading="eager" />
      <span className="loading-screen__veil" aria-hidden="true" />
      <div className="loading-screen__heading">
        <p className="screen-kicker">การวิเคราะห์ต้นแบบ</p>
        <h1 id="loading-title">{status}</h1>
        <p>{mode === "api" ? "บริการบนคลาวด์อาจใช้เวลาประมาณ 1 - 3 นาที" : "กำลังเตรียมข้อมูลต้นแบบ"}</p>
      </div>
      <div className="loading-screen__status">
        <div className="loading-percentage" role="status" aria-label={status}><strong aria-hidden="true">•••</strong></div>
        <p>{status}</p>
        <div className="loading-progress" aria-hidden="true"><span /></div>
        <small>{mode === "mock" ? "โหมดจำลองกำลังทำงาน ไม่มีการส่งหรือวิเคราะห์รูปภาพจริง" : "ส่วนหน้าของระบบจะไม่จัดเก็บรูปภาพหรือผลลัพธ์ของคุณ"}</small>
      </div>
    </section>
  );
}
