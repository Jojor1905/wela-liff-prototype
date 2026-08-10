import type { ProductItem } from "@/src/models/product";
import { Icon } from "./icons";

export function ProductCard({ product, selected, onToggle, onDetails }: { product: ProductItem; selected: boolean; onToggle: () => void; onDetails: () => void }) {
  return (
    <article className={`product-card ${selected ? "is-selected" : ""}`}>
      {product.image_url ? (
        // The Product API owns this optional URL; rendering it directly avoids inventing a local branded image.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="product-image" src={product.image_url} alt={`ภาพผลิตภัณฑ์ ${product.name}`} />
      ) : <div className="product-pack product-pack--neutral" aria-label="ไม่มีภาพผลิตภัณฑ์"><Icon name="image" /><small>ไม่มีภาพ</small></div>}
      <div className="product-card__body">
        <div className="product-card__meta"><span>แค็ตตาล็อกต้นแบบ</span><span>{product.condition_names_th.join(" · ")}</span></div>
        <h3>{product.name}</h3><p className="product-category">{product.category}</p><p>{product.reason}</p>
        <div className="product-card__bottom"><span>ไม่มีข้อมูลราคาและสต็อก</span><button type="button" onClick={onDetails}>ดูรายละเอียด</button></div>
      </div>
      <button className="select-product" type="button" onClick={onToggle} aria-pressed={selected}>
        {selected ? <><Icon name="check" /> เลือกแล้ว</> : "เลือกผลิตภัณฑ์นี้"}
      </button>
    </article>
  );
}
