import { Icon } from "./icons";

const defaultDisclaimer = "การวิเคราะห์ภาพนี้เป็นการทดลองเพื่อสาธิตต้นแบบเท่านั้น ผลลัพธ์อาจไม่ครบถ้วนหรือคลาดเคลื่อน และไม่ใช่การวินิจฉัยทางการแพทย์";

export function PrototypeDisclaimer({ text = defaultDisclaimer }: { text?: string }) {
  return (
    <aside className="disclaimer">
      <Icon name="lock" />
      <p>{text}</p>
    </aside>
  );
}
