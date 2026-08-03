import type { ReactNode } from "react";
import { Icon } from "./icons";

export function OptionCard({ label, description, selected, onClick, illustration, multiple = false }: { label: string; description?: string; selected: boolean; onClick: () => void; illustration?: ReactNode; multiple?: boolean }) {
  return (
    <button className={`option-card ${selected ? "is-selected" : ""}`} type="button" onClick={onClick} aria-pressed={selected}>
      {illustration ? <span className="option-card__art" aria-hidden="true">{illustration}</span> : null}
      <span className="option-card__copy"><strong>{label}</strong>{description ? <small>{description}</small> : null}</span>
      <span className={`option-card__control ${multiple ? "is-square" : ""}`} aria-hidden="true">{selected ? <Icon name="check" /> : null}</span>
    </button>
  );
}
