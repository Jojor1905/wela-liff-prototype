import { mockProducts } from "@/src/data/mock-products";
import { ProductCard } from "./ProductCard";

export function ProductSection({ selectedIds, onToggle, onDetails }: { selectedIds: string[]; onToggle: (id: string) => void; onDetails: (id: string) => void }) {
  return (
    <section className="product-section" aria-labelledby="products-title">
      <div className="section-heading"><span>กิจวัตรจากแบบสอบถาม</span><h1 id="products-title">สามขั้นตอนที่คัดสรรอย่างพอดี</h1><p>เลือกจากผลิตภัณฑ์จำลองตามเป้าหมายที่คุณระบุ ไม่มีการสั่งซื้อจริง</p></div>
      <div className="product-list">
        {mockProducts.map((product) => <ProductCard key={product.id} product={product} selected={selectedIds.includes(product.id)} onToggle={() => onToggle(product.id)} onDetails={() => onDetails(product.id)} />)}
      </div>
    </section>
  );
}
