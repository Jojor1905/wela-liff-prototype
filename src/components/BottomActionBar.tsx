import { Icon } from "./icons";

export function BottomActionBar({ label = "ถัดไป", onClick, disabled, secondaryLabel, onSecondary }: { label?: string; onClick: () => void; disabled?: boolean; secondaryLabel?: string; onSecondary?: () => void }) {
  return (
    <div className="bottom-action">
      {secondaryLabel && onSecondary ? <button className="text-action" type="button" onClick={onSecondary}>{secondaryLabel}</button> : null}
      <button className="primary-action" type="button" onClick={onClick} disabled={disabled}>
        <span>{label}</span><Icon name="arrow-right" />
      </button>
    </div>
  );
}
