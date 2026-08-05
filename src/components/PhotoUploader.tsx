import type { ChangeEvent } from "react";
import { Icon } from "./icons";

const acceptedImageTypes = "image/jpeg,image/png,image/webp";

export function PhotoUploader({ onPhoto }: { onPhoto: (file: File, source: "camera" | "library") => void | Promise<void> }) {
  function select(event: ChangeEvent<HTMLInputElement>, source: "camera" | "library") {
    const file = event.target.files?.[0];
    if (file) void onPhoto(file, source);
    event.target.value = "";
  }
  return (
    <div className="photo-actions">
      <label className="photo-choice photo-choice--primary">
        <Icon name="camera" /><span><strong>ถ่ายรูป</strong><small>ใช้กล้องหน้าของคุณ</small></span>
        <input type="file" accept={acceptedImageTypes} capture="user" onChange={(event) => select(event, "camera")} />
      </label>
      <label className="photo-choice">
        <Icon name="image" /><span><strong>เลือกจากคลังรูปภาพ</strong><small>เลือกรูปที่ชัดเจนและถ่ายไว้ไม่นาน</small></span>
        <input type="file" accept={acceptedImageTypes} onChange={(event) => select(event, "library")} />
      </label>
    </div>
  );
}
