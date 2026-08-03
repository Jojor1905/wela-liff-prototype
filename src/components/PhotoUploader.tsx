import type { ChangeEvent } from "react";
import { Icon } from "./icons";

export function PhotoUploader({ onPhoto }: { onPhoto: (file: File, source: "camera" | "library") => void }) {
  function select(event: ChangeEvent<HTMLInputElement>, source: "camera" | "library") {
    const file = event.target.files?.[0];
    if (file) onPhoto(file, source);
    event.target.value = "";
  }
  return (
    <div className="photo-actions">
      <label className="photo-choice photo-choice--primary">
        <Icon name="camera" /><span><strong>Take a photo</strong><small>Use your front camera</small></span>
        <input type="file" accept="image/*" capture="user" onChange={(event) => select(event, "camera")} />
      </label>
      <label className="photo-choice">
        <Icon name="image" /><span><strong>Choose from library</strong><small>Select a clear, recent image</small></span>
        <input type="file" accept="image/*" onChange={(event) => select(event, "library")} />
      </label>
    </div>
  );
}
