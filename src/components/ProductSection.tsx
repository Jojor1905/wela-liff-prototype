import type { RuleProductRecommendation } from "@/src/types/skin-rules";
import { ProductCard } from "./ProductCard";

export function ProductSection({ products, selectedIds, onToggle, onDetails }: { products: RuleProductRecommendation[]; selectedIds: string[]; onToggle: (id: string) => void; onDetails: (id: string) => void }) {
  return (
    <section className="product-section" aria-labelledby="products-title">
      <div className="section-heading"><span>ทางเลือกจากเอกสารกฎ</span><h1 id="products-title">ผลิตภัณฑ์ที่สัมพันธ์กับคำตอบของคุณ</h1><p>รายการในกลุ่มเดียวกันเป็นทางเลือก ไม่ใช่ขั้นตอนที่ต้องใช้พร้อมกันหรือการรับประกันผลลัพธ์</p></div>
      <div className="product-list">
        {products.map((product) => <ProductCard key={product.id} product={product} selected={selectedIds.includes(product.id)} onToggle={() => onToggle(product.id)} onDetails={() => onDetails(product.id)} />)}
      </div>
    </section>
  );
}
