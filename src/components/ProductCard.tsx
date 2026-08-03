import type { ProductRecommendation } from "@/src/models/wela";
import { Icon } from "./icons";

export function ProductCard({ product, selected, onToggle, onDetails }: { product: ProductRecommendation; selected: boolean; onToggle: () => void; onDetails: () => void }) {
  return (
    <article className={`product-card ${selected ? "is-selected" : ""}`}>
      <div className={`product-pack product-pack--${product.tone}`} aria-hidden="true"><span>WELA</span><i /></div>
      <div className="product-card__body">
        <div className="product-card__meta"><span>{product.priority}</span><span>Mock product</span></div>
        <h3>{product.name}</h3><p className="product-category">{product.category}</p><p>{product.role}</p>
        <div className="product-card__bottom"><strong>฿{product.price.toLocaleString("en-GB")}</strong><button type="button" onClick={onDetails}>View details</button></div>
      </div>
      <button className="select-product" type="button" onClick={onToggle} aria-pressed={selected}>
        {selected ? <><Icon name="check" /> Selected</> : "Add to routine"}
      </button>
    </article>
  );
}
