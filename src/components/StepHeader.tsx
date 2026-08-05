import { Icon } from "./icons";

export function StepHeader({ onBack, onExit, label = "Wela" }: { onBack?: () => void; onExit?: () => void; label?: string }) {
  return (
    <header className="step-header">
      {onBack ? (
        <button className="icon-button" type="button" onClick={onBack} aria-label="ย้อนกลับ"><Icon name="arrow-left" /></button>
      ) : <span className="step-header__spacer" />}
      <p className="step-header__brand">{label}</p>
      {onExit ? (
        <button className="icon-button" type="button" onClick={onExit} aria-label="ออกจากแบบประเมิน"><Icon name="close" /></button>
      ) : <span className="step-header__spacer" />}
    </header>
  );
}
