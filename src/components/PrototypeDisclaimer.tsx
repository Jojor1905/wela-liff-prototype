import { Icon } from "./icons";

const defaultDisclaimer = "Experimental visual analysis for prototype demonstration only. Results may be incomplete or inaccurate and are not a medical diagnosis.";

export function PrototypeDisclaimer({ text = defaultDisclaimer }: { text?: string }) {
  return (
    <aside className="disclaimer">
      <Icon name="lock" />
      <p>{text}</p>
    </aside>
  );
}
