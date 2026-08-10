import { productForCategory, requestedProductCategories, type RecommendationState } from "@/src/models/recommendation";

const categoryLabels = {
  cleanser: "CLEANSER",
  serum: "SERUM",
  moisturizer: "MOISTURIZER",
  sunscreen: "SUNSCREEN",
} as const;

export function AnalysisRecommendations({ recommendation }: { recommendation: RecommendationState }) {
  return (
    <section className="analysis-recommendations" aria-labelledby="analysis-recommendations-title">
      <div className="section-heading">
        <span>คำแนะนำจากแบบสอบถาม</span>
        <h2 id="analysis-recommendations-title">หมวดหมู่ผลิตภัณฑ์ที่แนะนำ</h2>
        {recommendation.conditions.length ? (
          <p>อ้างอิงจาก {recommendation.conditions.map((condition) => condition.nameTh).join(" · ")}</p>
        ) : (
          <p>ยังไม่มีคำตอบที่ตรงกับเงื่อนไขในแค็ตตาล็อกผลิตภัณฑ์ปัจจุบัน</p>
        )}
      </div>
      <div className="recommendation-list">
        {requestedProductCategories.map((category) => {
          const product = productForCategory(recommendation.products, category);
          return (
            <article key={category}>
              <span>{categoryLabels[category]}</span>
              {product ? (
                <>
                  <h3>{product.name}</h3>
                  <p>{product.reason}</p>
                </>
              ) : (
                <>
                  <h3>ยังไม่มีผลิตภัณฑ์ในหมวดนี้</h3>
                  <p>บริการผลิตภัณฑ์ปัจจุบันยังไม่ส่งคืนรายการสำหรับหมวดนี้</p>
                </>
              )}
            </article>
          );
        })}
      </div>
      {recommendation.productStatus === "error" ? <p className="recommendation-status" role="status">{recommendation.productError}</p> : null}
      {recommendation.needsClarification.map((message) => <p className="recommendation-status" key={message}>{message}</p>)}
    </section>
  );
}
