import type { RuleProductRecommendation } from "@/src/types/skin-rules";
import { Icon } from "./icons";

export function ProductCard({ product, selected, onToggle, onDetails }: { product: RuleProductRecommendation; selected: boolean; onToggle: () => void; onDetails: () => void }) {
  return (
    <article className={`product-card ${selected ? "is-selected" : ""}`}>
      <div className="product-pack product-pack--ivory" aria-hidden="true"><span>WELA</span><i /></div>
      <div className="product-card__body">
        <div className="product-card__meta"><span>{product.optional ? "ทางเลือก" : "ตัวเลือกหลัก"}</span><span>จากเอกสารกฎ</span></div>
        <h3>{product.name}</h3><p className="product-category">{product.category} · {product.displayNameTh}</p><p>{product.reason}</p>
        {product.patchTestRecommended ? <small className="product-safety-note">แนะนำให้ทดสอบในบริเวณเล็ก ๆ ก่อนใช้</small> : null}
        <div className="product-card__bottom"><small>อ้างอิงหน้า {product.sourcePages.join(", ")}</small><button type="button" onClick={onDetails}>ดูรายละเอียด</button></div>
      </div>
      <button className="select-product" type="button" onClick={onToggle} aria-pressed={selected}>
        {selected ? <><Icon name="check" /> เลือกเป็นทางเลือกแล้ว</> : "เลือกผลิตภัณฑ์นี้"}
      </button>
    </article>
  );
}
