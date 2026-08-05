import type { AnalysisErrorState } from "@/src/models/wela";
import { Icon } from "./icons";

export function AnalysisError({ error, onRetry, onChooseAnother }: { error: AnalysisErrorState; onRetry: () => void; onChooseAnother: () => void }) {
  return (
    <section className="analysis-error" aria-live="assertive" aria-labelledby="analysis-error-title">
      <div className="analysis-error__mark" aria-hidden="true"><Icon name={error.code === "invalid-image" ? "image" : "close"} /></div>
      <p className="screen-kicker">หยุดการวิเคราะห์ชั่วคราว</p>
      <h1 id="analysis-error-title">{error.title}</h1>
      <p>{error.message}</p>
      <div className="analysis-error__actions">
        {error.canRetry ? <button className="primary-action" type="button" onClick={onRetry}>ลองวิเคราะห์อีกครั้ง</button> : null}
        <button className="secondary-action" type="button" onClick={onChooseAnother}>เลือกรูปอื่น</button>
      </div>
      <small>คำตอบและรูปภาพที่เลือกยังคงอยู่ในเบราว์เซอร์นี้เพื่อให้คุณลองอีกครั้ง</small>
      {error.requestId ? <small className="analysis-error__reference">รหัสอ้างอิง: {error.requestId}</small> : null}
    </section>
  );
}
