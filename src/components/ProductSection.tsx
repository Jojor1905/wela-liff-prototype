import type { ProductItem } from "@/src/models/product";
import { ProductCard } from "./ProductCard";

export function ProductSection({ products, selectedIds, onToggle, onDetails }: { products: ProductItem[]; selectedIds: string[]; onToggle: (id: string) => void; onDetails: (id: string) => void }) {
  return (
    <section className="product-section" aria-labelledby="products-title">
      <div className="section-heading"><span>แค็ตตาล็อกผลิตภัณฑ์ต้นแบบ</span><h1 id="products-title">ผลิตภัณฑ์ที่สอดคล้องกับข้อมูลของคุณ</h1><p>รายการนี้มาจากบริการผลิตภัณฑ์ตามเงื่อนไขที่คุณระบุ ไม่มีข้อมูลราคา สต็อก หรือการสั่งซื้อ</p></div>
      {products.length ? (
        <div className="product-list">
          {products.map((product) => <ProductCard key={product.id} product={product} selected={selectedIds.includes(product.id)} onToggle={() => onToggle(product.id)} onDetails={() => onDetails(product.id)} />)}
        </div>
      ) : <p className="product-empty">ยังไม่มีผลิตภัณฑ์จากบริการที่ตรงกับข้อมูลชุดนี้</p>}
    </section>
  );
}
