import { Icon } from "./icons";

export function BottomActionBar({ label = "ถัดไป", onClick, disabled, secondaryLabel, onSecondary, showIcon = true }: { label?: string; onClick: () => void; disabled?: boolean; secondaryLabel?: string; onSecondary?: () => void; showIcon?: boolean }) {
  return (
    <div className="bottom-action">
      {secondaryLabel && onSecondary ? <button className="text-action" type="button" onClick={onSecondary}>{secondaryLabel}</button> : null}
      <button className="primary-action" type="button" onClick={onClick} disabled={disabled}>
        <span>{label}</span>{showIcon ? <Icon name="arrow-right" /> : null}
      </button>
    </div>
  );
}
