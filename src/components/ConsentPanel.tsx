import Image from "next/image";

const privacyBenefits = [
  {
    title: "ใช้รูปภาพเพื่อวิเคราะห์สภาพผิวเท่านั้น",
    description: "ไม่ใช้เพื่อวัตถุประสงค์อื่นนอกเหนือจากการวิเคราะห์ผิว",
    iconSrc: "/images/icon/face-icon.svg",
  },
  {
    title: "ไม่เผยแพร่หรือแบ่งปันให้บุคคลภายนอก",
    description: "จัดเก็บข้อมูลของคุณด้วยระบบที่เชื่อถือได้",
    iconSrc: "/images/icon/lock-icon.svg",
  },
  {
    title: "เก็บรักษาข้อมูลอย่างปลอดภัย",
    description: "ด้วยระบบที่ได้มาตรฐานและเชื่อถือได้",
    iconSrc: "/images/icon/security-icon.svg",
  },
  {
    title: "ลบรูปภาพเมื่อสิ้นสุดการวิเคราะห์",
    description: "จัดเก็บข้อมูลของคุณด้วยระบบที่เชื่อถือได้",
    iconSrc: "/images/icon/delete-icon.svg",
  },
] as const;

type ConsentPanelProps = {
  imageConsentAccepted: boolean;
  onImageConsentChange: (value: boolean) => void;
  policyAccepted: boolean;
  onPolicyChange: (value: boolean) => void;
};

export function ConsentPanel({
  imageConsentAccepted,
  onImageConsentChange,
  policyAccepted,
  onPolicyChange,
}: ConsentPanelProps) {
  return (
    <>
      <ul className="privacy-benefits" aria-label="การดูแลข้อมูลของ Wela">
        {privacyBenefits.map((benefit) => (
          <li className="privacy-benefit" key={benefit.title}>
            <span className="privacy-benefit__icon" aria-hidden="true">
              <Image src={benefit.iconSrc} alt="" width={26} height={26} />
            </span>
            <span className="privacy-benefit__copy">
              <strong>{benefit.title}</strong>
              <small>{benefit.description}</small>
            </span>
          </li>
        ))}
      </ul>

      <div className="consent-panel" role="group" aria-label="ข้อตกลงที่ต้องยอมรับ">
        <label className="consent-checkbox">
          <input type="checkbox" checked={imageConsentAccepted} onChange={(event) => onImageConsentChange(event.target.checked)} />
          <span>ฉันยินยอมให้ Wela ใช้รูปภาพของฉันเพื่อวิเคราะห์สภาพผิว</span>
        </label>
        <label className="consent-checkbox">
          <input type="checkbox" checked={policyAccepted} onChange={(event) => onPolicyChange(event.target.checked)} />
          <span>
            ฉันได้อ่านและยอมรับ <strong>นโยบายความเป็นส่วนตัว</strong> และ <strong>ข้อกำหนดการใช้งาน</strong>
          </span>
        </label>
      </div>
    </>
  );
}
