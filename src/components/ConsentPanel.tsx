export function ConsentPanel({ requiredAccepted, onRequiredChange, historyAccepted, onHistoryChange, lineAccepted, onLineChange, analysisMode }: { requiredAccepted: boolean; onRequiredChange: (value: boolean) => void; historyAccepted: boolean; onHistoryChange: (value: boolean) => void; lineAccepted: boolean; onLineChange: (value: boolean) => void; analysisMode: "api" | "mock" }) {
  return (
    <div className="consent-list">
      <label className="consent-row consent-row--required">
        <input type="checkbox" checked={requiredAccepted} onChange={(event) => onRequiredChange(event.target.checked)} />
        <span><strong>ข้อตกลงที่จำเป็นสำหรับต้นแบบ</strong><small>{analysisMode === "api" ? "ฉันเข้าใจว่ารูปภาพที่เลือกจะถูกส่งไปยังบริการวิเคราะห์ภายในที่กำหนดและประมวลผลชั่วคราวด้วยโมเดลทดลอง acne_lesion ผลลัพธ์อาจไม่ครบถ้วนหรือคลาดเคลื่อน ส่วนหน้าของระบบจะไม่จัดเก็บข้อมูล ผลลัพธ์ไม่ใช่การวินิจฉัยทางการแพทย์และไม่ทดแทนคำแนะนำจากผู้เชี่ยวชาญ" : "ฉันเข้าใจว่า Wela ใช้ข้อมูลจำลองในโหมดนี้ โดยจะไม่อัปโหลดหรือวิเคราะห์รูปภาพ ผลลัพธ์เป็นเพียงการจำลอง ไม่ใช่การวินิจฉัยทางการแพทย์และไม่ทดแทนคำแนะนำจากผู้เชี่ยวชาญ"}</small></span>
      </label>
      <div className="consent-divider"><span>ตัวเลือกเสริม · ยังไม่เปิดใช้งาน</span></div>
      <label className="consent-row">
        <input type="checkbox" checked={historyAccepted} onChange={(event) => onHistoryChange(event.target.checked)} />
        <span><strong>ประวัติการปรึกษาในอนาคต</strong><small>แสดงตัวอย่างการบันทึกคำตอบและคำแนะนำจำลองสำหรับบริการในอนาคต ขณะนี้ไม่มีการจัดเก็บข้อมูล</small></span>
      </label>
      <label className="consent-row">
        <input type="checkbox" checked={lineAccepted} onChange={(event) => onLineChange(event.target.checked)} />
        <span><strong>การติดตามผ่าน LINE ในอนาคต</strong><small>แสดงตัวอย่างการแจ้งเตือนกิจวัตรหรือการช่วยเหลือจากที่ปรึกษา ตัวเลือกนี้แยกจากการลงชื่อเข้าใช้ LINE และจะไม่มีการส่งข้อความ</small></span>
      </label>
    </div>
  );
}
