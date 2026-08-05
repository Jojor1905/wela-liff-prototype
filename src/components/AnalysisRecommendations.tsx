import type { AnalysisResult } from "@/src/models/wela";

export function AnalysisRecommendations({ result }: { result: AnalysisResult }) {
  return (
    <section className="analysis-recommendations" aria-labelledby="analysis-recommendations-title">
      <div className="section-heading"><span>คำแนะนำจากแบบสอบถาม</span><h2 id="analysis-recommendations-title">หมวดหมู่ผลิตภัณฑ์ที่แนะนำ</h2></div>
      <div className="recommendation-list">
        {result.productRecommendations.map((recommendation) => (
          <article key={`${recommendation.category}-${recommendation.focus}`}>
            <span>{recommendation.category}</span>
            <h3>{recommendation.focus}</h3>
            <p>{recommendation.rationale}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
