"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecommendation } from "@/src/context/RecommendationContext";
import { releaseUploadedPhoto } from "@/src/lib/photo-flow";
import { recommendationForNewImage, toggleRecommendationProduct } from "@/src/models/recommendation";
import { BottomActionBar } from "./BottomActionBar";
import { Icon } from "./icons";
import { MobileShell } from "./MobileShell";
import { ProductSection } from "./ProductSection";
import { ProgressIndicator } from "./ProgressIndicator";
import { PrototypeDisclaimer } from "./PrototypeDisclaimer";
import { StepHeader } from "./StepHeader";

const ProductsList = () => {
  const router = useRouter();
  const { recommendation, setRecommendation } = useRecommendation();
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailProduct = useMemo(
    () => recommendation.products.find((product) => product.id === detailId) ?? null,
    [detailId, recommendation.products],
  );

  function toggleProduct(id: string) {
    setRecommendation((current) => toggleRecommendationProduct(current, id));
  }

  function restart() {
    releaseUploadedPhoto(recommendation.photo);
    setRecommendation(recommendationForNewImage());
    router.push("/");
  }

  if (detailProduct) {
    return (
      <MobileShell>
        <StepHeader onBack={() => setDetailId(null)} onExit={restart} label="รายละเอียดผลิตภัณฑ์" />
        <section className="product-detail">
          {detailProduct.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="detail-product-image" src={detailProduct.image_url} alt={`ภาพผลิตภัณฑ์ ${detailProduct.name}`} />
          ) : <div className="detail-pack product-pack--neutral" aria-label="ไม่มีภาพผลิตภัณฑ์"><Icon name="image" /><small>ไม่มีภาพผลิตภัณฑ์</small></div>}
          <p className="screen-kicker">แค็ตตาล็อกผลิตภัณฑ์ต้นแบบ</p>
          <h1>{detailProduct.name}</h1>
          <p className="detail-category">{detailProduct.category}</p>
          <p>{detailProduct.reason}</p>
          <dl>
            <div><dt>ข้อมูลที่ใช้แนะนำ</dt><dd>{detailProduct.condition_names_th.join(" · ")}</dd></div>
            <div><dt>ข้อมูลราคาและสต็อก</dt><dd>ไม่มีข้อมูลจาก API</dd></div>
          </dl>
          <div className="detail-rationale"><h2>เหตุผลที่แนะนำ</h2><p>{detailProduct.reason}</p></div>
          <button className={`detail-select ${recommendation.selectedProductIds.includes(detailProduct.id) ? "is-selected" : ""}`} type="button" onClick={() => toggleProduct(detailProduct.id)}>
            {recommendation.selectedProductIds.includes(detailProduct.id) ? <><Icon name="check" /> เลือกผลิตภัณฑ์นี้แล้ว</> : "เลือกผลิตภัณฑ์นี้"}
          </button>
          <PrototypeDisclaimer text={recommendation.productDisclaimer} />
        </section>
        <BottomActionBar label="กลับไปยังคำแนะนำ" onClick={() => setDetailId(null)} secondaryLabel="จบการทดลองใช้" onSecondary={restart} />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <StepHeader onBack={() => router.back()} onExit={restart} />
      <ProgressIndicator current={7} total={7} label="คำแนะนำของคุณ" />
      <ProductSection products={recommendation.products} selectedIds={recommendation.selectedProductIds} onToggle={toggleProduct} onDetails={setDetailId} />
      {recommendation.products.length ? (
        <div className="routine-summary"><span>เลือกแล้ว {recommendation.selectedProductIds.length} รายการ</span><strong>ไม่มีข้อมูลราคา</strong></div>
      ) : null}
      <PrototypeDisclaimer text={recommendation.productDisclaimer} />
      <BottomActionBar
        label={recommendation.products.length ? "ดูผลิตภัณฑ์ที่เลือก" : "กลับไปเริ่มแบบประเมิน"}
        onClick={() => {
          const firstSelected = recommendation.selectedProductIds[0];
          if (firstSelected) setDetailId(firstSelected);
          else if (!recommendation.products.length) router.push("/");
        }}
        disabled={recommendation.products.length > 0 && !recommendation.selectedProductIds.length}
        secondaryLabel={recommendation.products.length ? "เริ่มใหม่" : undefined}
        onSecondary={recommendation.products.length ? restart : undefined}
      />
    </MobileShell>
  );
};

export default ProductsList;
