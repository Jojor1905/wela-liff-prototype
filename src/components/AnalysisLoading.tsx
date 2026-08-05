import Image from "next/image";

export function AnalysisLoading({ phase, mode }: { phase: "uploading" | "analysing"; mode: "api" | "mock" }) {
  return (
    <section className="loading-screen" aria-live="polite" aria-labelledby="loading-title">
      <Image className="loading-screen__background" src="/images/backgrounds/loading-bg.png" alt="" fill sizes="(max-width: 480px) 100vw, 480px" loading="eager" />
      <span className="loading-screen__veil" aria-hidden="true" />
      <div className="loading-screen__heading">
        <p className="screen-kicker">การวิเคราะห์ต้นแบบ</p>
        <h1 id="loading-title">กำลังวิเคราะห์สภาพผิวของคุณ</h1>
        <p>ใช้เวลาประมาณ 15 - 30 วินาที</p>
      </div>
      <div className="loading-screen__status">
        <div className="loading-percentage" role="progressbar" aria-label={phase === "uploading" ? "กำลังส่งรูปภาพไปยังบริการภายใน" : "กำลังเตรียมผลการวิเคราะห์"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={96}><strong>96%</strong></div>
        <p>กำลังสแกนผิวของคุณ...</p>
        <div className="loading-progress" aria-hidden="true"><span /></div>
        <small>{mode === "mock" ? "โหมดจำลองกำลังทำงาน ไม่มีการส่งหรือวิเคราะห์รูปภาพจริง" : "ส่วนหน้าของระบบจะไม่จัดเก็บรูปภาพหรือผลลัพธ์ของคุณ"}</small>
      </div>
    </section>
  );
}
