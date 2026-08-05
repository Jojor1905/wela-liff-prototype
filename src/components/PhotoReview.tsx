import type { UploadedPhoto } from "@/src/models/wela";
import { Icon } from "./icons";

export function PhotoReview({
  photo,
  onPersonalised,
  onImmediate,
  onChooseAnother,
}: {
  photo: UploadedPhoto;
  onPersonalised: () => void;
  onImmediate: () => void;
  onChooseAnother: () => void;
}) {
  return (
    <section className="photo-review" aria-labelledby="photo-review-title">
      <figure className="photo-review__portrait">
        {/* Object URLs are browser-local and cannot be processed by Next's image optimiser. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.previewUrl} alt="รูปภาพใบหน้าที่คุณเลือกเพื่อการวิเคราะห์" />
      </figure>

      <div className="photo-review__copy">
        <span className="photo-review__check" aria-hidden="true"><Icon name="check" /></span>
        <div>
          <h1 id="photo-review-title">เสร็จสิ้นพร้อมวิเคราะห์</h1>
          <p>ตอบคำถามไลฟ์สไตล์ของคุณจะช่วยให้ AI วิเคราะห์และแนะนำการดูแลผิวได้ตรงกับคุณมากยิ่งขึ้น</p>
        </div>
      </div>

      <div className="photo-review__actions">
        <button className="photo-review__primary" type="button" onClick={onPersonalised}>ตอบคำถามเพิ่มเติม</button>
        <button className="photo-review__secondary" type="button" onClick={onImmediate}>รับผลวิเคราะห์ทันที</button>
        <button className="photo-review__replace" type="button" onClick={onChooseAnother}>เลือกรูปใหม่</button>
      </div>
    </section>
  );
}
