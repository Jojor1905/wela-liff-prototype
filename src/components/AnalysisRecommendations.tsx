import type { EvidenceSource, SkinRecommendationResult } from "@/src/types/skin-rules";

const sourceLabels: Record<EvidenceSource, string> = {
  model: "จากโมเดล",
  questionnaire: "จากแบบสอบถาม",
  combined: "ข้อมูลร่วม",
};

function SourceLabel({ source }: { source: EvidenceSource }) {
  return <span className={`evidence-source evidence-source--${source}`}>{sourceLabels[source]}</span>;
}

function pageReference(pages: number[]): string {
  return pages.length ? `อ้างอิงหน้า ${pages.join(", ")}` : "อ้างอิงผลจากระบบปัจจุบัน";
}

export function AnalysisRecommendations({ recommendation }: { recommendation: SkinRecommendationResult }) {
  return (
    <section className="rule-recommendations" aria-labelledby="rule-recommendations-title">
      <div className="section-heading">
        <span>คำแนะนำแบบกำหนดกฎ</span>
        <h2 id="rule-recommendations-title">เป้าหมาย ส่วนผสม และกิจวัตร</h2>
        <p>ผลิตภัณฑ์และลำดับทั้งหมดมาจากเอกสารกฎที่ได้รับอนุมัติ โดยแยกหลักฐานจากภาพและแบบสอบถามอย่างชัดเจน</p>
      </div>

      <section className="condition-results" aria-labelledby="condition-results-title">
        <h3 id="condition-results-title">ความกังวลที่ใช้จัดกิจวัตร</h3>
        {recommendation.primaryCondition ? (
          <div className="condition-result condition-result--primary">
            <div><span>ความกังวลหลัก</span><SourceLabel source={recommendation.primaryCondition.source} /></div>
            <strong>{recommendation.primaryCondition.displayNameTh}</strong>
            <small>{pageReference(recommendation.primaryCondition.sourcePages)}</small>
          </div>
        ) : <p className="recommendation-empty">ยังไม่มีหลักฐานเฉพาะเพียงพอสำหรับเลือกกิจวัตรหลัก</p>}
        {recommendation.secondaryConditions.map((condition) => (
          <div className="condition-result" key={condition.conditionId}>
            <div><span>ความกังวลรอง</span><SourceLabel source={condition.source} /></div>
            <strong>{condition.displayNameTh}</strong>
            <small>{pageReference(condition.sourcePages)}</small>
          </div>
        ))}
      </section>

      <div className="recommendation-columns">
        <section aria-labelledby="goals-title"><h3 id="goals-title">เป้าหมายที่แนะนำ</h3><ul>{recommendation.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul></section>
        <section aria-labelledby="ingredients-title"><h3 id="ingredients-title">ส่วนผสมที่แนะนำ</h3><ul>{recommendation.recommendedIngredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul></section>
      </div>

      <section className="routine-plan" aria-labelledby="routine-title">
        <h3 id="routine-title">กิจวัตรเช้าและเย็น</h3>
        {(["am", "pm"] as const).map((period) => (
          <div className="routine-period" key={period}>
            <h4>{period === "am" ? "ตอนเช้า" : "ตอนเย็น"}</h4>
            {recommendation.routine[period].length ? <ol>{recommendation.routine[period].map((step) => (
              <li key={step.id}>
                <span>{step.step}</span>
                <div><div><strong>{step.type}</strong><SourceLabel source={step.source} /></div><p>{step.product}</p><small>{step.reason} · {pageReference(step.sourcePages)}{step.optional ? " · ขั้นตอนเสริม" : ""}</small></div>
              </li>
            ))}</ol> : <p className="recommendation-empty">ต้องการคำตอบเพิ่มเติมก่อนจัดกิจวัตร</p>}
          </div>
        ))}
      </section>

      <section className="evidence-details" aria-labelledby="evidence-title">
        <h3 id="evidence-title">รายละเอียดหลักฐาน</h3>
        {recommendation.evidence.map((item) => (
          <article key={item.id}>
            <div><strong>{item.label}</strong><SourceLabel source={item.source} /></div>
            <ul>{item.supportingEvidence.map((evidence) => <li key={`${evidence.label}-${evidence.value}`}><span>{evidence.label}</span><small>{evidence.value}</small></li>)}</ul>
            {item.confidence === undefined ? null : <small>ความมั่นใจเฉลี่ยจากโมเดล {(item.confidence * 100).toFixed(1)}%</small>}
            <small>{pageReference(item.sourcePages)}</small>
          </article>
        ))}
      </section>

      {recommendation.warnings.length ? <aside className="recommendation-warnings" aria-labelledby="warnings-title"><h3 id="warnings-title">ข้อควรระวังของระบบ</h3><ul>{recommendation.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></aside> : null}
    </section>
  );
}
