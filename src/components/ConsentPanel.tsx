export function ConsentPanel({ requiredAccepted, onRequiredChange, historyAccepted, onHistoryChange, lineAccepted, onLineChange, analysisMode }: { requiredAccepted: boolean; onRequiredChange: (value: boolean) => void; historyAccepted: boolean; onHistoryChange: (value: boolean) => void; lineAccepted: boolean; onLineChange: (value: boolean) => void; analysisMode: "api" | "mock" }) {
  return (
    <div className="consent-list">
      <label className="consent-row consent-row--required">
        <input type="checkbox" checked={requiredAccepted} onChange={(event) => onRequiredChange(event.target.checked)} />
        <span><strong>Required prototype acknowledgement</strong><small>{analysisMode === "api" ? "I understand that my selected photo will be sent to the configured local analysis service and processed temporarily by the experimental acne_lesion model. Results may be incomplete or inaccurate, are not stored by this front end, are not a medical diagnosis, and do not replace professional advice." : "I understand that Wela is using mock data in this mode and will not upload or analyse my photo. Results are simulated, not a medical diagnosis, and do not replace professional advice."}</small></span>
      </label>
      <div className="consent-divider"><span>Optional · not yet active</span></div>
      <label className="consent-row">
        <input type="checkbox" checked={historyAccepted} onChange={(event) => onHistoryChange(event.target.checked)} />
        <span><strong>Future consultation history</strong><small>Illustrate saving my answers and mock recommendations in a future service. Nothing is persisted now.</small></span>
      </label>
      <label className="consent-row">
        <input type="checkbox" checked={lineAccepted} onChange={(event) => onLineChange(event.target.checked)} />
        <span><strong>Future LINE follow-up</strong><small>Illustrate routine reminders or advisor support. This choice is separate from signing in with LINE, and no message is sent.</small></span>
      </label>
    </div>
  );
}
