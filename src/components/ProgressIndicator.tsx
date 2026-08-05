export function ProgressIndicator({ current, total, label }: { current: number; total: number; label: string }) {
  const value = Math.round((current / total) * 100);
  return (
    <div className="progress" aria-label={`${label} ขั้นตอนที่ ${current} จาก ${total}`}>
      <div className="progress__meta"><span>{label}</span><span>{current} / {total}</span></div>
      <div className="progress__track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}
