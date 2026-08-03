import type { AnalysisResult, UploadedPhoto } from "@/src/models/wela";
import { PrototypeDisclaimer } from "./PrototypeDisclaimer";

const regionNames: Record<AnalysisResult["dominantRegion"], string> = {
  forehead: "Forehead",
  leftCheek: "Left cheek",
  rightCheek: "Right cheek",
  chin: "Chin",
  nose: "Nose",
  none: "No dominant region",
};

export function AnalysisSummary({ result, photo }: { result: AnalysisResult; photo: UploadedPhoto | null }) {
  return (
    <>
      <section className="result-hero">
        <div className="result-portrait">
          {photo ? (
            // Browser-created object URLs are intentionally rendered directly and never sent to Next's image optimiser.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.previewUrl} alt="Your locally selected preview" />
          ) : <div className="portrait-placeholder" aria-label="Illustrative portrait placeholder"><span /></div>}
        </div>
        <div className="result-score">
          <span>Prototype skin score</span><strong>{result.skinScore}</strong><small>Experimental indicator</small>
        </div>
      </section>
      <section className="analysis-summary" aria-labelledby="summary-title">
        <div><p className="screen-kicker">{result.source === "api" ? "Your model-assisted prototype result" : "Your mock result"}</p><h1 id="summary-title">A calm view of what is visible</h1></div>
        <dl className="summary-measures">
          <div><dt>Visible spots</dt><dd>{result.lesionCount}</dd></div>
          <div><dt>Dominant region</dt><dd>{regionNames[result.dominantRegion]}</dd></div>
          <div><dt>Visible breakout level</dt><dd>{result.severityLevel}</dd></div>
          <div><dt>Confidence summary</dt><dd>{result.confidenceSummary}</dd></div>
        </dl>
      </section>
      <PrototypeDisclaimer text={result.disclaimer} />
    </>
  );
}
