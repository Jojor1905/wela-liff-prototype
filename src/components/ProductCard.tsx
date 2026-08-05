import type { ProductRecommendation } from "@/src/models/wela";
import { Icon } from "./icons";

export function ProductCard({ product, selected, onToggle, onDetails }: { product: ProductRecommendation; selected: boolean; onToggle: () => void; onDetails: () => void }) {
  return (
    <article className={`product-card ${selected ? "is-selected" : ""}`}>
      <div className={`product-pack product-pack--${product.tone}`} aria-hidden="true"><span>WELA</span><i /></div>
      <div className="product-card__body">
        <div className="product-card__meta"><span>{product.priority === "Essential" ? "จำเป็น" : "ทางเลือก"}</span><span>ผลิตภัณฑ์จำลอง</span></div>
        <h3>{product.name}</h3><p className="product-category">{product.category}</p><p>{product.role}</p>
        <div className="product-card__bottom"><strong>฿{product.price.toLocaleString("th-TH")}</strong><button type="button" onClick={onDetails}>ดูรายละเอียด</button></div>
      </div>
      <button className="select-product" type="button" onClick={onToggle} aria-pressed={selected}>
        {selected ? <><Icon name="check" /> เลือกแล้ว</> : "เพิ่มในกิจวัตร"}
      </button>
    </article>
  );
}
