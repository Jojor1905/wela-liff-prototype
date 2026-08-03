import type { AnalysisErrorState } from "@/src/models/wela";
import { Icon } from "./icons";

export function AnalysisError({ error, onRetry, onChooseAnother }: { error: AnalysisErrorState; onRetry: () => void; onChooseAnother: () => void }) {
  return (
    <section className="analysis-error" aria-live="assertive" aria-labelledby="analysis-error-title">
      <div className="analysis-error__mark" aria-hidden="true"><Icon name={error.code === "invalid-image" ? "image" : "close"} /></div>
      <p className="screen-kicker">Analysis paused</p>
      <h1 id="analysis-error-title">{error.title}</h1>
      <p>{error.message}</p>
      <div className="analysis-error__actions">
        {error.canRetry ? <button className="primary-action" type="button" onClick={onRetry}>Try analysis again</button> : null}
        <button className="secondary-action" type="button" onClick={onChooseAnother}>Choose another photo</button>
      </div>
      <small>Your consultation answers and selected photo remain available in this browser for retry.</small>
    </section>
  );
}
