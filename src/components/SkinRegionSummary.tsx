import type { AnalysisResult } from "@/src/models/wela";

const regions: { key: keyof AnalysisResult["regionCounts"]; label: string }[] = [
  { key: "forehead", label: "Forehead" },
  { key: "leftCheek", label: "Left cheek" },
  { key: "rightCheek", label: "Right cheek" },
  { key: "chin", label: "Chin" },
  { key: "nose", label: "Nose" },
];

export function SkinRegionSummary({ result }: { result: AnalysisResult }) {
  return (
    <section className="region-summary" aria-labelledby="region-title">
      <div className="section-heading"><span>{result.source === "api" ? "Experimental acne_lesion output" : "Mock acne_lesion output"}</span><h2 id="region-title">Visible spot distribution</h2></div>
      <div className="region-bars">
        {regions.map(({ key, label }) => (
          <div className="region-bar" key={key}>
            <div><span>{label}</span><strong>{result.regionCounts[key]}</strong></div>
            <span className="region-bar__track"><i style={{ width: `${result.regionCounts[key] === 0 ? 0 : Math.min(100, result.regionCounts[key] * 30)}%` }} /></span>
          </div>
        ))}
      </div>
      <p className="questionnaire-note"><strong>Questionnaire context</strong> Skin type, sensitivity, dark circles, and your broader goals come only from your selections—not from visual analysis.</p>
    </section>
  );
}
