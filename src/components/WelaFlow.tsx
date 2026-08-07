"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { mockProducts } from "@/src/data/mock-products";
import { canContinueFromConsent, flowSteps, historySteps, mainButtonDestinations, previousFlowStep, progressSteps, resolveRestoredStep, type FlowStep } from "@/src/lib/flow-navigation";
import { decodeBrowserImage, releaseUploadedPhoto, replaceUploadedPhoto, verifyPhotoDecodes } from "@/src/lib/photo-flow";
import { normaliseGender, type AnalysisErrorState, type AnalysisPhase, type AnalysisResult, type Gender, type UploadedPhoto, type UserAnswers } from "@/src/models/wela";
import { AnalysisApiError, validateImageFile } from "@/src/services/analysis-api";
import { analysisMode, runAnalysis, warmAnalysisService } from "@/src/services/analysis-service";
import { AnalysisError } from "./AnalysisError";
import { AnalysisLoading } from "./AnalysisLoading";
import { AnalysisRecommendations } from "./AnalysisRecommendations";
import { AnalysisSummary } from "./AnalysisSummary";
import { BottomActionBar } from "./BottomActionBar";
import { ConsentPanel } from "./ConsentPanel";
import { Icon } from "./icons";
import { MobileShell } from "./MobileShell";
import { OptionCard } from "./OptionCard";
import { PhotoUploader } from "./PhotoUploader";
import { PhotoReview } from "./PhotoReview";
import { ProductSection } from "./ProductSection";
import { ProgressIndicator } from "./ProgressIndicator";
import { PrototypeDisclaimer } from "./PrototypeDisclaimer";
import { SkinRegionSummary } from "./SkinRegionSummary";
import { StepHeader } from "./StepHeader";

const initialAnswers: UserAnswers = { concerns: [], goals: [] };
const missingPhotoMessage = "ไม่พบรูปภาพที่เลือก โปรดถ่ายรูปหรือเลือกจากคลังรูปภาพอีกครั้ง";

const genderOptions = [
  { value: "woman", label: "ผู้หญิง", imageSrc: "/images/questionnaire/gender/female.svg", imageAlt: "ไอคอนผู้หญิง" },
  { value: "man", label: "ผู้ชาย", imageSrc: "/images/questionnaire/gender/male.svg", imageAlt: "ไอคอนผู้ชาย" },
  { value: "non-binary", label: "อื่นๆ", imageSrc: "/images/questionnaire/gender/other.svg", imageAlt: "ไอคอนเพศอื่นๆ" },
] as const satisfies ReadonlyArray<{ value: Gender; label: string; imageSrc: string; imageAlt: string }>;

function historyStep(state: unknown): FlowStep | null {
  if (!state || typeof state !== "object" || !("welaStep" in state)) return null;
  const value = (state as { welaStep?: unknown }).welaStep;
  return typeof value === "string" && historySteps.includes(value as FlowStep) ? value as FlowStep : null;
}

function writeHistoryStep(step: FlowStep, mode: "push" | "replace") {
  const state = window.history.state && typeof window.history.state === "object" ? window.history.state : {};
  const nextState = { ...state, welaStep: step };
  if (mode === "push") window.history.pushState(nextState, "", window.location.href);
  else window.history.replaceState(nextState, "", window.location.href);
}

const ageRangeOptions = [
  { value: "18–29", label: "18 - 24 ปี", imageSrc: "/images/questionnaire/age/age-18-24.png", imageAlt: "ช่วงอายุ 18 ถึง 24 ปี" },
  { value: "30–39", label: "25 - 34 ปี", imageSrc: "/images/questionnaire/age/age-25-34.png", imageAlt: "ช่วงอายุ 25 ถึง 34 ปี" },
  { value: "40–49", label: "35 - 44 ปี", imageSrc: "/images/questionnaire/age/age-35-44.png", imageAlt: "ช่วงอายุ 35 ถึง 44 ปี" },
  { value: "50+", label: "55 ปีขึ้นไป", imageSrc: "/images/questionnaire/age/age-55-plus.png", imageAlt: "ช่วงอายุ 55 ปีขึ้นไป" },
] as const;

const skinTypeOptions = [
  { value: "balanced", label: "ผิวธรรมดา (Normal Skin)", description: "รู้สึกสบายผิวตลอดวัน", imageSrc: "/images/questionnaire/skintype/normal-skin.png", imageAlt: "ลักษณะผิวธรรมดา" },
  { value: "dry", label: "ผิวแห้ง (Dry Skin)", description: "มักรู้สึกตึงหรือขาดความชุ่มชื้น", imageSrc: "/images/questionnaire/skintype/dry-skin.png", imageAlt: "ลักษณะผิวแห้ง" },
  { value: "oily", label: "ผิวมัน (Oily Skin)", description: "มักมีความมันระหว่างวัน", imageSrc: "/images/questionnaire/skintype/oily-skin.png", imageAlt: "ลักษณะผิวมัน" },
  { value: "combination", label: "ผิวผสม (Combination Skin)", description: "แต่ละบริเวณมีลักษณะแตกต่างกัน", imageSrc: "/images/questionnaire/skintype/combinaton-skin.png", imageAlt: "ลักษณะผิวผสม" },
  { value: "unsure", label: "ผิวแพ้ง่าย (Sensitive Skin)", description: "ผิวตอบสนองต่อผลิตภัณฑ์หรือสภาพแวดล้อมได้ง่าย", imageSrc: "/images/questionnaire/skintype/sensitive-skin.png", imageAlt: "ลักษณะผิวแพ้ง่าย" },
] as const;

const concernOptions = [
  { value: "visible-breakouts", label: "สิวและรอยสิว" },
  { value: "dark-spots", label: "จุดด่างดำ" },
  { value: "wrinkles", label: "ริ้วรอย" },
  { value: "large-pores", label: "รูขุมขนกว้าง" },
  { value: "dullness", label: "ผิวหมองคล้ำ" },
  { value: "melasma-freckles", label: "ฝ้า / กระ" },
  { value: "uneven-looking-tone", label: "สีผิวไม่สม่ำเสมอ" },
  { value: "dry-flaking", label: "ผิวแห้งลอก" },
] as const satisfies ReadonlyArray<{ value: UserAnswers["concerns"][number]; label: string }>;

export function WelaFlow() {
  const [step, setStep] = useState<FlowStep>(flowSteps.consent);
  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers);
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalysisErrorState | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [questionnaireNotice, setQuestionnaireNotice] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<AnalysisPhase>("connecting");
  const [imageConsentAccepted, setImageConsentAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["quiet-cleanse", "daily-veil"]);
  const [detailId, setDetailId] = useState<string>(mockProducts[0].id);
  const activeRequest = useRef<AbortController | null>(null);
  const photoRef = useRef<UploadedPhoto | null>(null);
  const requiredConsentRef = useRef(false);

  const progressIndex = Math.max(1, progressSteps.indexOf(step) + 1);
  const selectedGender = normaliseGender(answers.gender);
  const detailProduct = useMemo(() => mockProducts.find((product) => product.id === detailId) ?? mockProducts[0], [detailId]);
  const consentAccepted = canContinueFromConsent(imageConsentAccepted, policyAccepted);

  useEffect(() => () => releaseUploadedPhoto(photoRef.current), []);

  useEffect(() => {
    if (!photo || analysisMode === "mock") return;
    const controller = new AbortController();
    void warmAnalysisService(controller.signal).catch(() => undefined);
    return () => controller.abort();
  }, [photo]);

  useEffect(() => {
    const storedStep = historyStep(window.history.state);
    let recoveryTimer: number | undefined;

    if (storedStep) {
      const restoredStep = resolveRestoredStep({ requestedStep: storedStep, consentAccepted: requiredConsentRef.current, hasPhoto: Boolean(photoRef.current) });
      const needsConsentRecovery = restoredStep === flowSteps.consent && storedStep !== flowSteps.consent;
      const needsPhotoRecovery = restoredStep === flowSteps.photoSource && storedStep !== flowSteps.photoSource;
      if (restoredStep !== storedStep) writeHistoryStep(restoredStep, "replace");
      recoveryTimer = window.setTimeout(() => {
        if (needsPhotoRecovery) setPhotoError(missingPhotoMessage);
        if (needsConsentRecovery) setPhotoError(null);
        setStep(restoredStep);
      }, 0);
    } else {
      writeHistoryStep(flowSteps.consent, "replace");
    }

    function handlePopState(event: PopStateEvent) {
      const previousStep = historyStep(event.state);
      if (!previousStep) return;
      const restoredStep = resolveRestoredStep({ requestedStep: previousStep, consentAccepted: requiredConsentRef.current, hasPhoto: Boolean(photoRef.current) });
      if (restoredStep === flowSteps.photoSource && restoredStep !== previousStep) {
        setPhotoError(missingPhotoMessage);
      }
      if (restoredStep !== previousStep) writeHistoryStep(restoredStep, "replace");
      setStep(restoredStep);
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      if (recoveryTimer) window.clearTimeout(recoveryTimer);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (step !== "loading") return;
    const controller = new AbortController();
    activeRequest.current = controller;
    runAnalysis({ answers, photo, signal: controller.signal, onPhase: setLoadingPhase })
      .then((analysis) => {
        if (!controller.signal.aborted) {
          setResult(analysis);
          writeHistoryStep("result", "replace");
          setStep("result");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const state = analysisErrorState(error);
        setAnalysisError(state);
        writeHistoryStep("analysis-error", "replace");
        setStep("analysis-error");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    return () => {
      controller.abort();
      if (activeRequest.current === controller) activeRequest.current = null;
    };
  }, [step, answers, photo]);

  function go(next: FlowStep) {
    writeHistoryStep(next, "push");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function beginAnalysis() {
    setAnalysisError(null);
    setLoadingPhase(analysisMode === "api" ? "connecting" : "finalising");
    go(mainButtonDestinations.analysisLoading);
  }
  function chooseAnotherPhoto() {
    activeRequest.current?.abort();
    releaseUploadedPhoto(photoRef.current);
    photoRef.current = null;
    setPhoto(null);
    setResult(null);
    setAnalysisError(null);
    setPhotoError(null);
    go(flowSteps.photoSource);
  }
  function back() {
    const previousStep = previousFlowStep(step);
    if (!previousStep) return;
    if (historyStep(window.history.state) === step && window.history.length > 1) {
      window.history.back();
      return;
    }
    writeHistoryStep(previousStep, "replace");
    setStep(previousStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    activeRequest.current?.abort();
    writeHistoryStep(flowSteps.consent, "replace");
    requiredConsentRef.current = false;
    setStep(flowSteps.consent); setAnswers(initialAnswers); setResult(null); setAnalysisError(null); setPhotoError(null); setQuestionnaireNotice(null); setImageConsentAccepted(false); setPolicyAccepted(false);
    releaseUploadedPhoto(photoRef.current); photoRef.current = null; setPhoto(null);
  }
  function setSingle<K extends keyof UserAnswers>(key: K, value: UserAnswers[K]) { setAnswers((current) => ({ ...current, [key]: value })); }
  function toggleMulti(key: "concerns" | "goals", value: UserAnswers[typeof key][number]) {
    setAnswers((current) => {
      const values = current[key] as string[];
      return { ...current, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
    });
  }
  async function acceptPhoto(file: File, source: "camera" | "library") {
    try {
      validateImageFile(file);
      await verifyPhotoDecodes(file, decodeBrowserImage);
    } catch (error) {
      setPhotoError(error instanceof AnalysisApiError ? "โปรดเลือกรูปภาพ JPEG, PNG หรือ WEBP ที่มีขนาดไม่เกิน 10 MB" : "ไม่สามารถอ่านรูปภาพนี้ได้ โปรดเลือกรูปภาพ JPEG, PNG หรือ WEBP อื่น");
      return;
    }
    setPhotoError(null);
    const nextPhoto = replaceUploadedPhoto(photoRef.current, file, source);
    photoRef.current = nextPhoto;
    setPhoto(nextPhoto);
    go(flowSteps.photoReview);
  }
  function toggleProduct(id: string) { setSelectedProducts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  if (step === "welcome") return (
    <MobileShell className="home-landing-screen">
      <button className="home-landing__back" type="button" aria-label="ย้อนกลับ" onClick={back}>
        <Icon name="arrow-left" />
      </button>
      <section className="home-landing" aria-labelledby="home-scan-title">
        <header className="home-landing__heading">
          <h1 id="home-scan-title">
            <span>สแกนใบหน้า</span>
            <span>วิเคราะห์ผิวด้วย AI</span>
          </h1>
          <p>ใช้เวลาเพียง 30 วินาที</p>
        </header>

        <figure className="home-scanner">
          <div className="home-scanner__circle" aria-hidden="true" />
          <Image
            className="home-scanner__portrait"
            src="/images/backgrounds/landingpage-bg.png"
            alt="ภาพผู้หญิงหันหน้าตรง พร้อมลายวิเคราะห์ใบหน้าแบบตกแต่ง"
            width={347}
            height={400}
            priority
          />
          <span className="home-scanner__corner home-scanner__corner--top-left" aria-hidden="true" />
          <span className="home-scanner__corner home-scanner__corner--top-right" aria-hidden="true" />
          <span className="home-scanner__corner home-scanner__corner--bottom-left" aria-hidden="true" />
          <span className="home-scanner__corner home-scanner__corner--bottom-right" aria-hidden="true" />
        </figure>

        <aside className="home-instructions" aria-label="คำแนะนำก่อนสแกน">
          <ul>
            <li><Icon name="sun" /><span>อยู่บริเวณที่มี<br />แสงสว่างเพียงพอ</span></li>
            <li><Icon name="glasses" /><span>ไม่สวมแว่น<br />หรือหมวก</span></li>
            <li><Icon name="smile" /><span>มองตรง<br />ไม่เอียงหน้า</span></li>
          </ul>
        </aside>
      </section>
      <button className="home-landing__start" type="button" aria-label="เริ่มสแกน" onClick={() => go(mainButtonDestinations.scanIntroduction)}>
        <Icon name="scan" />
        <span>เริ่มสแกน</span>
      </button>
    </MobileShell>
  );

  if (step === "loading") return <MobileShell className="loading-shell"><AnalysisLoading phase={loadingPhase} mode={analysisMode} /></MobileShell>;

  if (step === "analysis-error" && analysisError) return (
    <MobileShell><StepHeader onBack={() => go(photo ? "preview" : "upload")} onExit={reset} label="การวิเคราะห์" />
      <AnalysisError error={analysisError} onRetry={beginAnalysis} onChooseAnother={chooseAnotherPhoto} />
    </MobileShell>
  );

  const header = <><StepHeader onBack={back} onExit={reset} /><ProgressIndicator current={progressIndex} total={progressSteps.length} label={step === "result" || step === "products" ? "คำแนะนำของคุณ" : "แบบประเมินของคุณ"} /></>;

  if (step === "intro") return (
    <MobileShell>{<StepHeader onBack={back} onExit={reset} />}
      <section className="intro-screen">
        <p className="screen-kicker">ก่อนเริ่มต้น</p><h1>คำถามที่ใส่ใจไม่กี่ข้อ เพื่อกิจวัตรที่เรียบง่าย</h1><p>Wela นำเป้าหมายและความชอบของคุณมาจัดเป็นประสบการณ์ต้นแบบที่สงบและเป็นขั้นตอน</p>
        <ol className="how-list"><li><span>1</span><div><strong>บอกสิ่งที่สำคัญกับคุณ</strong><small>เลือกลักษณะผิวและเป้าหมายของคุณ</small></div></li><li><span>2</span><div><strong>ตรวจสอบความยินยอม</strong><small>{analysisMode === "api" ? "รูปภาพจะถูกส่งไปยังบริการวิเคราะห์ภายในที่กำหนด หลังจากคุณยินยอมเท่านั้น" : "โหมดจำลองเก็บรูปไว้ในเบราว์เซอร์นี้และไม่มีการวิเคราะห์จริง"}</small></div></li><li><span>3</span><div><strong>สำรวจคำแนะนำต้นแบบ</strong><small>ดูผล acne_lesion แบบจำกัดและผลิตภัณฑ์ที่อ้างอิงจากแบบสอบถาม</small></div></li></ol>
        <PrototypeDisclaimer />
      </section><BottomActionBar label="ถัดไป" onClick={() => go(mainButtonDestinations.beforeQuestionnaire)} />
    </MobileShell>
  );

  if (step === "gender") return (
    <MobileShell className="questionnaire-shell">{header}<QuestionHeading kicker="เกี่ยวกับคุณ" title="เพศของคุณคือเพศอะไร?" body="เพื่อให้เราสามารถวิเคราะห์ผิวคุณได้แม่นยำยิ่งขึ้นตามเพศของคุณ" />
      {questionnaireNotice ? <div className="questionnaire-entry-notice" role="status"><Icon name="lock" /><p>{questionnaireNotice}</p></div> : null}
      <div className="option-list option-list--gender">
        {genderOptions.map((option) => <OptionCard key={option.value} label={option.label} selected={selectedGender === option.value} onClick={() => setSingle("gender", option.value)} illustration={<Image className="gender-option-image" src={option.imageSrc} alt={option.imageAlt} width={33} height={33} />} illustrationHidden={false} />)}
      </div><BottomActionBar label="ถัดไป" onClick={() => go("age")} disabled={!selectedGender} />
    </MobileShell>
  );

  if (step === "age") return (
    <MobileShell className="questionnaire-shell">{header}<QuestionHeading kicker="เกี่ยวกับคุณ" title="คุณอายุเท่าไหร่?" body="เพื่อให้การวิเคราะห์สภาพผิวแม่นยำยิ่งขึ้นตามช่วงวัยของคุณ" />
      <div className="option-list option-list--portraits">{ageRangeOptions.map((option) => <OptionCard key={option.value} label={option.label} selected={answers.ageRange === option.value} onClick={() => setSingle("ageRange", option.value)} illustration={<Image className="age-option-image" src={option.imageSrc} alt={option.imageAlt} width={85} height={72} />} illustrationHidden={false} />)}</div>
      <BottomActionBar label="ถัดไป" onClick={() => go("skin-type")} disabled={!answers.ageRange} />
    </MobileShell>
  );

  if (step === "skin-type") return (
    <MobileShell className="questionnaire-shell">{header}<QuestionHeading kicker="ผิวของคุณ" title="ลักษณะผิวของคุณเป็นแบบใด" body="ข้อมูลนี้จะช่วยให้ AI วิเคราะห์สภาพผิวของคุณได้ละเอียดและแนะนำผลิตภัณฑ์ได้เหมาะสมยิ่งขึ้น" />
      <div className="option-list option-list--textures">{skinTypeOptions.map((option) => <OptionCard key={option.value} label={option.label} description={option.description} selected={answers.skinType === option.value} onClick={() => setSingle("skinType", option.value)} illustration={<Image className="skin-texture-image" src={option.imageSrc} alt={option.imageAlt} width={68} height={58} />} illustrationHidden={false} />)}</div>
      <BottomActionBar label="ถัดไป" onClick={() => go("concerns")} disabled={!answers.skinType} />
    </MobileShell>
  );

  if (step === "concerns") return (
    <MobileShell className="questionnaire-shell">{header}<QuestionHeading kicker="สิ่งที่คุณให้ความสำคัญ" title="คุณกังวลเรื่องผิวด้านใดมากที่สุด" body="เลือกได้มากกว่า 1 ข้อ" />
      <div className="option-list option-list--compact">{concernOptions.map((option) => <OptionCard key={option.value} label={option.label} selected={answers.concerns.includes(option.value)} onClick={() => toggleMulti("concerns", option.value)} multiple />)}</div>
      <BottomActionBar label="ถัดไป" onClick={() => go("goals")} disabled={!answers.concerns.length} />
    </MobileShell>
  );

  if (step === "goals") return (
    <MobileShell className="questionnaire-shell">{header}<QuestionHeading kicker="เป้าหมายของคุณ" title="คุณอยากให้กิจวัตรการดูแลผิวช่วยเรื่องใด?" body="เลือกเป้าหมายที่เหมาะกับคุณในวันนี้" />
      <div className="goal-grid">{[
        ["calmer-looking-skin", "ผิวดูสงบและสบายขึ้น", "leaf"], ["comfortable-hydration", "เติมความชุ่มชื้นอย่างสบายผิว", "sparkle"], ["more-even-looking-tone", "ผิวดูสม่ำเสมอยิ่งขึ้น", "sun"], ["simpler-routine", "กิจวัตรที่เรียบง่ายขึ้น", "moon"],
      ].map(([value, label, icon]) => <button key={value} className={`goal-card ${answers.goals.includes(value as UserAnswers["goals"][number]) ? "is-selected" : ""}`} type="button" aria-pressed={answers.goals.includes(value as UserAnswers["goals"][number])} onClick={() => toggleMulti("goals", value as UserAnswers["goals"][number])}><Icon name={icon as "leaf"} /><span>{label}</span></button>)}</div>
      <BottomActionBar label="ถัดไป" onClick={beginAnalysis} disabled={!answers.goals.length} />
    </MobileShell>
  );

  if (step === "consent") return (
    <MobileShell className="consent-screen">
      <StepHeader onExit={reset} />
      <section className="consent-hero" aria-labelledby="consent-title">
        <p className="screen-kicker">ความเป็นส่วนตัวของคุณ</p>
        <h1 id="consent-title"><span>เราจะดูแลข้อมูลของคุณ</span><span>อย่างปลอดภัย</span></h1>
        <p>เพื่อความแม่นยำในการวิเคราะห์ Wela จะใช้รูปใบหน้าของคุณ เฉพาะขั้นตอนนี้เท่านั้น โดยไม่มีการนำไปใช้อย่างอื่น และจัดการข้อมูลอย่างรัดกุมตามนโยบายของเรา</p>
      </section>
      <ConsentPanel
        imageConsentAccepted={imageConsentAccepted}
        onImageConsentChange={(accepted) => {
          requiredConsentRef.current = canContinueFromConsent(accepted, policyAccepted);
          setImageConsentAccepted(accepted);
        }}
        policyAccepted={policyAccepted}
        onPolicyChange={(accepted) => {
          requiredConsentRef.current = canContinueFromConsent(imageConsentAccepted, accepted);
          setPolicyAccepted(accepted);
        }}
      />
      <BottomActionBar label="ฉันยินยอม" onClick={() => { if (consentAccepted) go(mainButtonDestinations.consent); }} disabled={!consentAccepted} showIcon={false} />
    </MobileShell>
  );

  if (step === "upload" || (step === "preview" && !photo)) return (
    <MobileShell className="photo-source-shell">{header}<QuestionHeading kicker="เลือกรูปภาพ" title="เลือกรูปภาพที่คุณต้องการใช้ในการวิเคราะห์" body={analysisMode === "api" ? "เบราว์เซอร์จะแสดงตัวอย่างก่อน และจะส่งไปยังบริการภายในที่กำหนดเมื่อคุณยืนยันเท่านั้น" : "โหมดจำลองจะเก็บรูปที่เลือกไว้ในหน่วยความจำของเบราว์เซอร์สำหรับเซสชันนี้"} />
      <div className="upload-stage">
        <div className="upload-stage__illustration" aria-hidden="true">
          <Image className="upload-stage__image" src="/images/backgrounds/input-bg.svg" alt="" width={336} height={288} sizes="(max-width: 480px) calc(100vw - 2.5rem), 21rem" />
        </div>
      </div>
      {(step === "preview" && !photo) || photoError ? <div className="inline-image-error" role="alert"><Icon name="image" /><div><strong>โปรดเลือกรูปภาพอีกครั้ง</strong><p>{photoError ?? missingPhotoMessage}</p></div></div> : null}
      <PhotoUploader onPhoto={acceptPhoto} />
    </MobileShell>
  );

  if (step === "preview" && photo) return (
    <MobileShell className="photo-review-shell">
      <StepHeader onBack={back} onExit={reset} />
      <PhotoReview
        photo={photo}
        onPersonalised={() => { setQuestionnaireNotice(null); go(mainButtonDestinations.photoReview); }}
        onImmediate={beginAnalysis}
        onChooseAnother={chooseAnotherPhoto}
      />
    </MobileShell>
  );

  if (step === "result" && result) return (
    <MobileShell>{header}<AnalysisSummary result={result} photo={photo} /><SkinRegionSummary result={result} />
      <section className="insight-section"><h2>ข้อสังเกตจากภาพแบบจำกัด</h2>{result.insights.map((insight) => <p key={insight}>{insight}</p>)}</section>
      <section className="insight-section insight-section--questionnaire"><h2>ข้อมูลที่คุณระบุ</h2>{result.questionnaireInsights.map((insight) => <p key={insight}>{insight}</p>)}</section>
      <AnalysisRecommendations result={result} />
      <BottomActionBar label="ดูผลิตภัณฑ์ที่แนะนำ" onClick={() => go("products")} />
    </MobileShell>
  );

  if (step === "products") return (
    <MobileShell>{header}<ProductSection selectedIds={selectedProducts} onToggle={toggleProduct} onDetails={(id) => { setDetailId(id); go("product-detail"); }} />
      <div className="routine-summary"><span>เลือกผลิตภัณฑ์จำลอง {selectedProducts.length} รายการ</span><strong>฿{mockProducts.filter((product) => selectedProducts.includes(product.id)).reduce((sum, product) => sum + product.price, 0).toLocaleString("th-TH")}</strong></div>
      <PrototypeDisclaimer /><BottomActionBar label="ดูผลิตภัณฑ์ที่เลือก" onClick={() => { setDetailId(selectedProducts[0] ?? mockProducts[0].id); go("product-detail"); }} secondaryLabel="เริ่มใหม่" onSecondary={reset} />
    </MobileShell>
  );

  return (
    <MobileShell>{<StepHeader onBack={() => go("products")} onExit={reset} label="รายละเอียดผลิตภัณฑ์" />}
      <section className="product-detail">
        <div className={`detail-pack product-pack--${detailProduct.tone}`}><span>WELA</span><i /></div>
        <p className="screen-kicker">{detailProduct.priority === "Essential" ? "จำเป็น" : "ทางเลือก"} · ผลิตภัณฑ์จำลอง</p><h1>{detailProduct.name}</h1><p className="detail-category">{detailProduct.category}</p><p>{detailProduct.role}</p>
        <dl><div><dt>ลำดับในกิจวัตร</dt><dd>{detailProduct.usage}</dd></div><div><dt>ราคาสำหรับการสาธิต</dt><dd>฿{detailProduct.price.toLocaleString("th-TH")}</dd></div></dl>
        <div className="detail-rationale"><h2>เหตุผลที่แนะนำ</h2><p>คำแนะนำต้นแบบนี้อ้างอิงจากคำตอบในแบบสอบถามและผลสรุปสิวที่มองเห็นแบบจำลอง ไม่ใช่การรักษาหรือวินิจฉัยภาวะผิว</p></div>
        <button className={`detail-select ${selectedProducts.includes(detailProduct.id) ? "is-selected" : ""}`} type="button" onClick={() => toggleProduct(detailProduct.id)}>{selectedProducts.includes(detailProduct.id) ? <><Icon name="check" /> รวมอยู่ในกิจวัตรจำลอง</> : "เพิ่มในกิจวัตรจำลอง"}</button>
        <PrototypeDisclaimer />
      </section><BottomActionBar label="กลับไปยังคำแนะนำ" onClick={() => go("products")} secondaryLabel="จบการทดลองใช้" onSecondary={reset} />
    </MobileShell>
  );
}

function QuestionHeading({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return <section className="question-heading"><p className="screen-kicker">{kicker}</p><h1>{title}</h1><p>{body}</p></section>;
}

function analysisErrorState(error: unknown): AnalysisErrorState {
  if (error instanceof AnalysisApiError) {
    const titles: Record<AnalysisApiError["code"], string> = {
      "invalid-image": "ไม่สามารถใช้รูปภาพนี้ได้",
      network: "ไม่สามารถเชื่อมต่อบริการภายในได้",
      waking: "บริการวิเคราะห์ยังตื่นไม่เสร็จ",
      "model-not-ready": "โมเดลยังไม่พร้อมวิเคราะห์",
      timeout: "การวิเคราะห์ใช้เวลานานเกินไป",
      validation: "ข้อมูลแบบประเมินยังไม่ครบถ้วน",
      server: "การวิเคราะห์ภายในไม่สำเร็จ",
      "invalid-response": "ไม่สามารถอ่านผลลัพธ์ได้",
      configuration: "ยังไม่ได้ตั้งค่าบริการวิเคราะห์",
      cancelled: "ยกเลิกการวิเคราะห์แล้ว",
    };
    const messages: Record<AnalysisApiError["code"], string> = {
      "invalid-image": "โปรดเลือกรูปภาพ JPEG, PNG หรือ WEBP ที่ชัดเจนและมีขนาดไม่เกิน 10 MB",
      network: "โปรดตรวจสอบว่าบริการภายในกำลังทำงาน แล้วลองอีกครั้ง",
      waking: "บริการคลาวด์กำลังเริ่มทำงาน โปรดลองอีกครั้งในอีกสักครู่",
      "model-not-ready": "บริการเชื่อมต่อได้แล้ว แต่โมเดลยังเตรียมไม่เสร็จ โปรดลองอีกครั้ง",
      timeout: "โปรดลองวิเคราะห์อีกครั้งในอีกสักครู่",
      validation: "โปรดตรวจสอบคำตอบและรูปภาพก่อนลองอีกครั้ง",
      server: "เกิดปัญหาระหว่างการประมวลผล โปรดลองอีกครั้ง",
      "invalid-response": "บริการส่งผลลัพธ์ที่ไม่สามารถแสดงได้ โปรดลองอีกครั้ง",
      configuration: "โปรดตรวจสอบการตั้งค่าบริการก่อนเริ่มการวิเคราะห์",
      cancelled: "คำขอถูกยกเลิกแล้ว คุณสามารถเริ่มใหม่ได้ทุกเมื่อ",
    };
    return { code: error.code, title: titles[error.code], message: messages[error.code], canRetry: !["invalid-image", "validation", "configuration", "cancelled"].includes(error.code), requestId: error.requestId };
  }
  return { code: "server", title: "การวิเคราะห์ภายในไม่สำเร็จ", message: "เกิดปัญหาที่ไม่คาดคิด โปรดลองอีกครั้ง", canRetry: true };
}
