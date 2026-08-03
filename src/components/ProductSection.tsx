import { mockProducts } from "@/src/data/mock-products";
import { ProductCard } from "./ProductCard";

export function ProductSection({ selectedIds, onToggle, onDetails }: { selectedIds: string[]; onToggle: (id: string) => void; onDetails: (id: string) => void }) {
  return (
    <section className="product-section" aria-labelledby="products-title">
      <div className="section-heading"><span>Questionnaire-led routine</span><h1 id="products-title">A considered three-step edit</h1><p>Selected from typed mock products to suit your stated goals. No purchase will be made.</p></div>
      <div className="product-list">
        {mockProducts.map((product) => <ProductCard key={product.id} product={product} selected={selectedIds.includes(product.id)} onToggle={() => onToggle(product.id)} onDetails={() => onDetails(product.id)} />)}
      </div>
    </section>
  );
}
