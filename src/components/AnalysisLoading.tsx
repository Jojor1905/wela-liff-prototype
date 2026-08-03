import { Icon } from "./icons";

export function AnalysisLoading({ phase, mode }: { phase: "uploading" | "analysing"; mode: "api" | "mock" }) {
  return (
    <section className="loading-screen" aria-live="polite" aria-labelledby="loading-title">
      <div className="loading-emblem" aria-hidden="true"><Icon name="leaf" /><span /><span /><span /></div>
      <p className="screen-kicker">Experimental prototype analysis</p>
      <h1 id="loading-title">{phase === "uploading" ? "Sending your photo locally" : "Preparing your skin story"}</h1>
      <p>{phase === "uploading" ? "Your selected image and consultation answers are being sent to the configured local service." : "The result is being arranged into a calm, readable summary and questionnaire-led routine."}</p>
      <div className="upload-progress" role="progressbar" aria-label={phase === "uploading" ? "Uploading selected photo" : "Preparing analysis result"}><span /></div>
      <div className="loading-steps">
        <span className={phase === "uploading" ? "is-active" : "is-complete"}>Sending your photo</span>
        <span className={phase === "analysing" ? "is-active" : ""}>Reviewing acne_lesion output</span>
        <span>Composing your routine</span>
      </div>
      <small>{mode === "mock" ? "Mock mode is active; no image is sent or analysed." : "The front end does not store your photo or result."}</small>
    </section>
  );
}
