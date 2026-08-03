"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mockProducts } from "@/src/data/mock-products";
import type { AnalysisErrorState, AnalysisResult, UploadedPhoto, UserAnswers } from "@/src/models/wela";
import { AnalysisApiError, validateImageFile } from "@/src/services/analysis-api";
import { analysisMode, runAnalysis } from "@/src/services/analysis-service";
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
import { ProductSection } from "./ProductSection";
import { ProgressIndicator } from "./ProgressIndicator";
import { PrototypeDisclaimer } from "./PrototypeDisclaimer";
import { SkinRegionSummary } from "./SkinRegionSummary";
import { StepHeader } from "./StepHeader";

type Step = "welcome" | "intro" | "gender" | "age" | "skin-type" | "concerns" | "goals" | "photo-guide" | "consent" | "upload" | "preview" | "loading" | "analysis-error" | "result" | "products" | "product-detail";

const flow: Step[] = ["welcome", "intro", "gender", "age", "skin-type", "concerns", "goals", "photo-guide", "consent", "upload", "preview", "loading", "analysis-error", "result", "products", "product-detail"];
const consultationSteps = flow.filter((step) => !["welcome", "intro", "loading", "analysis-error", "product-detail"].includes(step));
const initialAnswers: UserAnswers = { concerns: [], goals: [] };

function ChoicePortrait({ variant }: { variant: number }) {
  return <span className={`choice-portrait choice-portrait--${variant}`}><i /><b /></span>;
}

export function WelaFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [answers, setAnswers] = useState<UserAnswers>(initialAnswers);
  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalysisErrorState | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<"uploading" | "analysing">("uploading");
  const [requiredConsent, setRequiredConsent] = useState(false);
  const [historyConsent, setHistoryConsent] = useState(false);
  const [lineConsent, setLineConsent] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["quiet-cleanse", "daily-veil"]);
  const [detailId, setDetailId] = useState<string>(mockProducts[0].id);
  const activeRequest = useRef<AbortController | null>(null);

  const stepIndex = flow.indexOf(step);
  const progressIndex = Math.max(1, consultationSteps.indexOf(step) + 1);
  const detailProduct = useMemo(() => mockProducts.find((product) => product.id === detailId) ?? mockProducts[0], [detailId]);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.previewUrl); }, [photo]);

  useEffect(() => {
    if (step !== "loading") return;
    const controller = new AbortController();
    activeRequest.current = controller;
    const phaseTimer = analysisMode === "api" ? window.setTimeout(() => setLoadingPhase("analysing"), 650) : undefined;
    runAnalysis({ answers, photo, signal: controller.signal })
      .then((analysis) => {
        if (!controller.signal.aborted) {
          setResult(analysis);
          setStep("result");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const state = analysisErrorState(error);
        setAnalysisError(state);
        setStep("analysis-error");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    return () => {
      if (phaseTimer) window.clearTimeout(phaseTimer);
      controller.abort();
      if (activeRequest.current === controller) activeRequest.current = null;
    };
  }, [step, answers, photo]);

  function go(next: Step) { setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function beginAnalysis() {
    setAnalysisError(null);
    setLoadingPhase(analysisMode === "api" ? "uploading" : "analysing");
    go("loading");
  }
  function back() { if (stepIndex > 0) go(flow[stepIndex - 1]); }
  function reset() {
    activeRequest.current?.abort();
    setStep("welcome"); setAnswers(initialAnswers); setResult(null); setAnalysisError(null); setPhotoError(null); setRequiredConsent(false); setHistoryConsent(false); setLineConsent(false);
    if (photo) URL.revokeObjectURL(photo.previewUrl); setPhoto(null);
  }
  function setSingle<K extends keyof UserAnswers>(key: K, value: UserAnswers[K]) { setAnswers((current) => ({ ...current, [key]: value })); }
  function toggleMulti(key: "concerns" | "goals", value: UserAnswers[typeof key][number]) {
    setAnswers((current) => {
      const values = current[key] as string[];
      return { ...current, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
    });
  }
  function acceptPhoto(file: File, source: "camera" | "library") {
    try {
      validateImageFile(file);
    } catch (error) {
      setPhotoError(error instanceof AnalysisApiError ? error.message : "This image could not be used. Please choose another JPEG, PNG, or WEBP image.");
      return;
    }
    setPhotoError(null);
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    setPhoto({ file, previewUrl: URL.createObjectURL(file), source }); go("preview");
  }
  function toggleProduct(id: string) { setSelectedProducts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  if (step === "welcome") return (
    <MobileShell className="welcome-screen">
      <header className="masthead"><span className="brand-word">Wela</span><span>Private prototype</span></header>
      <section className="welcome-portrait" aria-label="Editorial illustration for a private skincare consultation">
        <div className="portrait-art"><span className="portrait-art__hair" /><span className="portrait-art__face"><i /><b /></span><span className="portrait-art__neck" /><span className="portrait-art__shoulders" /></div>
        <div className="portrait-note"><Icon name="sparkle" /><span>Personalised around your answers</span></div>
      </section>
      <section className="welcome-copy">
        <p className="screen-kicker">A private skincare consultation</p>
        <h1>Time for skin,<br /><em>considered well.</em></h1>
        <p>Share your goals, review a photo with our local experimental service, and explore a concise prototype routine designed around you.</p>
      </section>
      <BottomActionBar label="Begin your consultation" onClick={() => go("intro")} secondaryLabel="See how it works" onSecondary={() => go("intro")} />
    </MobileShell>
  );

  if (step === "loading") return <MobileShell className="loading-shell"><AnalysisLoading phase={loadingPhase} mode={analysisMode} /></MobileShell>;

  if (step === "analysis-error" && analysisError) return (
    <MobileShell><StepHeader onBack={() => go(photo ? "preview" : "upload")} onExit={reset} label="Analysis" />
      <AnalysisError error={analysisError} onRetry={beginAnalysis} onChooseAnother={() => go("upload")} />
    </MobileShell>
  );

  const header = <><StepHeader onBack={back} onExit={reset} /><ProgressIndicator current={progressIndex} total={consultationSteps.length} label={step === "result" || step === "products" ? "Your recommendation" : "Your consultation"} /></>;

  if (step === "intro") return (
    <MobileShell>{<StepHeader onBack={back} onExit={reset} />}
      <section className="intro-screen">
        <p className="screen-kicker">Before we begin</p><h1>A few considered choices. One simple routine.</h1><p>Wela brings your goals and preferences into one calm, guided prototype.</p>
        <ol className="how-list"><li><span>1</span><div><strong>Tell us what matters</strong><small>Choose your skin context and goals.</small></div></li><li><span>2</span><div><strong>Review analysis consent</strong><small>{analysisMode === "api" ? "Your photo is sent only to the configured local analysis service after you agree." : "Mock mode keeps your photo in this browser and does not analyse it."}</small></div></li><li><span>3</span><div><strong>Explore a prototype edit</strong><small>Review the limited acne_lesion output and questionnaire-led products.</small></div></li></ol>
        <PrototypeDisclaimer />
      </section><BottomActionBar label="Continue" onClick={() => go("gender")} />
    </MobileShell>
  );

  if (step === "gender") return (
    <MobileShell>{header}<QuestionHeading kicker="About you" title="How would you like us to personalise this consultation?" body="This answer shapes questionnaire context only." />
      <div className="option-list option-list--portraits">
        {[{ value: "woman", label: "Woman" }, { value: "man", label: "Man" }, { value: "non-binary", label: "Non-binary" }, { value: "prefer-not-to-say", label: "Prefer not to say" }].map((item, index) => <OptionCard key={item.value} label={item.label} selected={answers.gender === item.value} onClick={() => setSingle("gender", item.value as UserAnswers["gender"])} illustration={<ChoicePortrait variant={index + 1} />} />)}
      </div><BottomActionBar onClick={() => go("age")} disabled={!answers.gender} />
    </MobileShell>
  );

  if (step === "age") return (
    <MobileShell>{header}<QuestionHeading kicker="About you" title="Which age range feels right?" body="Used only to tailor the mock product edit—not to make age-based claims." />
      <div className="option-list option-list--portraits">{["18–29", "30–39", "40–49", "50+"].map((value, index) => <OptionCard key={value} label={value} selected={answers.ageRange === value} onClick={() => setSingle("ageRange", value as UserAnswers["ageRange"])} illustration={<ChoicePortrait variant={index + 1} />} />)}</div>
      <BottomActionBar onClick={() => go("skin-type")} disabled={!answers.ageRange} />
    </MobileShell>
  );

  if (step === "skin-type") return (
    <MobileShell>{header}<QuestionHeading kicker="Your skin" title="How does your skin usually feel?" body="Choose the description that best reflects your own experience." />
      <div className="option-list">{[
        ["balanced", "Balanced", "Comfortable through most of the day"], ["dry", "Dry", "Often feels tight or in need of comfort"], ["oily", "Oily", "Often feels shiny through the day"], ["combination", "Combination", "Varies across different areas"], ["unsure", "Not sure", "We’ll keep the mock routine gentle and simple"],
      ].map(([value, label, description]) => <OptionCard key={value} label={label} description={description} selected={answers.skinType === value} onClick={() => setSingle("skinType", value as UserAnswers["skinType"])} />)}</div>
      <BottomActionBar onClick={() => go("concerns")} disabled={!answers.skinType} />
    </MobileShell>
  );

  if (step === "concerns") return (
    <MobileShell>{header}<QuestionHeading kicker="Your priorities" title="What would you like to focus on?" body="Select all that apply. These remain questionnaire-based." />
      <div className="option-list">{[
        ["visible-breakouts", "Visible breakouts"], ["sensitivity", "Comfort and sensitivity"], ["uneven-looking-tone", "More even-looking tone"], ["dark-circles", "The look of dark circles"], ["none", "No particular concern"],
      ].map(([value, label]) => <OptionCard key={value} label={label} selected={answers.concerns.includes(value as UserAnswers["concerns"][number])} onClick={() => toggleMulti("concerns", value as UserAnswers["concerns"][number])} multiple />)}</div>
      <BottomActionBar onClick={() => go("goals")} disabled={!answers.concerns.length} />
    </MobileShell>
  );

  if (step === "goals") return (
    <MobileShell>{header}<QuestionHeading kicker="Your intention" title="What should your routine help you achieve?" body="Choose up to the goals that feel most useful today." />
      <div className="goal-grid">{[
        ["calmer-looking-skin", "Calmer-looking skin", "leaf"], ["comfortable-hydration", "Comfortable hydration", "sparkle"], ["more-even-looking-tone", "More even-looking tone", "sun"], ["simpler-routine", "A simpler routine", "moon"],
      ].map(([value, label, icon]) => <button key={value} className={`goal-card ${answers.goals.includes(value as UserAnswers["goals"][number]) ? "is-selected" : ""}`} type="button" aria-pressed={answers.goals.includes(value as UserAnswers["goals"][number])} onClick={() => toggleMulti("goals", value as UserAnswers["goals"][number])}><Icon name={icon as "leaf"} /><span>{label}</span></button>)}</div>
      <BottomActionBar onClick={() => go("photo-guide")} disabled={!answers.goals.length} />
    </MobileShell>
  );

  if (step === "photo-guide") return (
    <MobileShell>{header}<QuestionHeading kicker="Photo preparation" title="A clear photo begins with calm, even light" body={analysisMode === "api" ? "After your acknowledgement, the selected image will be sent to the configured local service for temporary experimental analysis." : "Mock mode previews your selected image on this device without uploading or analysing it."} />
      <div className="photo-guide-art" aria-hidden="true"><div className="guide-face"><span /><i /><b /></div><i className="corner corner--a" /><i className="corner corner--b" /><i className="corner corner--c" /><i className="corner corner--d" /></div>
      <ul className="guidance-list"><li><Icon name="check" />Face the camera directly</li><li><Icon name="check" />Use soft, even lighting</li><li><Icon name="check" />Keep hair away from your face</li><li><Icon name="check" />Avoid filters and beauty effects</li></ul>
      <BottomActionBar label="Review privacy acknowledgement" onClick={() => go("consent")} />
    </MobileShell>
  );

  if (step === "consent") return (
    <MobileShell>{header}<QuestionHeading kicker="Your privacy" title="You remain in control" body="Please acknowledge the required prototype limits. Optional choices do not affect access." />
      <ConsentPanel requiredAccepted={requiredConsent} onRequiredChange={setRequiredConsent} historyAccepted={historyConsent} onHistoryChange={setHistoryConsent} lineAccepted={lineConsent} onLineChange={setLineConsent} analysisMode={analysisMode} />
      <BottomActionBar label="Continue to photo" onClick={() => go("upload")} disabled={!requiredConsent} secondaryLabel="Cancel consultation" onSecondary={reset} />
    </MobileShell>
  );

  if (step === "upload") return (
    <MobileShell>{header}<QuestionHeading kicker="Photo selection" title="Choose the image you’d like to analyse" body={analysisMode === "api" ? "The browser previews your selection first. It is sent to the configured local service only when you confirm." : "Mock mode keeps this selection in browser memory for the current session."} />
      <div className="upload-stage"><div className="upload-face" aria-hidden="true"><span /><i /><b /></div><p><Icon name="lock" />{analysisMode === "api" ? "Preview before local analysis" : "On-device preview only"}</p></div>
      {photoError ? <div className="inline-image-error" role="alert"><Icon name="image" /><div><strong>This image cannot be used</strong><p>{photoError}</p></div></div> : null}
      <PhotoUploader onPhoto={acceptPhoto} />{analysisMode === "mock" ? <button className="quiet-link" type="button" onClick={beginAnalysis}>Continue without a photo in mock mode</button> : null}
    </MobileShell>
  );

  if (step === "preview") return (
    <MobileShell>{header}<QuestionHeading kicker="Your preview" title="Is this photo clear and comfortable to use?" body={analysisMode === "api" ? "The image has not been sent yet. Confirm below to begin experimental local analysis." : "Mock mode will not inspect or transmit this image."} />
      <figure className="photo-preview">{photo ? (
        // Browser-created object URLs stay local and cannot be processed by Next's image optimiser.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.previewUrl} alt="Your selected local photo preview" />
      ) : null}<figcaption><Icon name="lock" />{analysisMode === "api" ? "Ready for local analysis" : "Local preview · mock mode"}</figcaption></figure>
      <BottomActionBar label={analysisMode === "api" ? "Begin local analysis" : "Prepare mock result"} onClick={beginAnalysis} secondaryLabel="Choose another photo" onSecondary={() => go("upload")} />
    </MobileShell>
  );

  if (step === "result" && result) return (
    <MobileShell>{header}<AnalysisSummary result={result} photo={photo} /><SkinRegionSummary result={result} />
      <section className="insight-section"><h2>Limited visual observations</h2>{result.insights.map((insight) => <p key={insight}>{insight}</p>)}</section>
      <section className="insight-section insight-section--questionnaire"><h2>Your declared context</h2>{result.questionnaireInsights.map((insight) => <p key={insight}>{insight}</p>)}</section>
      <AnalysisRecommendations result={result} />
      <BottomActionBar label="View your product edit" onClick={() => go("products")} />
    </MobileShell>
  );

  if (step === "products") return (
    <MobileShell>{header}<ProductSection selectedIds={selectedProducts} onToggle={toggleProduct} onDetails={(id) => { setDetailId(id); go("product-detail"); }} />
      <div className="routine-summary"><span>{selectedProducts.length} mock products selected</span><strong>฿{mockProducts.filter((product) => selectedProducts.includes(product.id)).reduce((sum, product) => sum + product.price, 0).toLocaleString("en-GB")}</strong></div>
      <PrototypeDisclaimer /><BottomActionBar label="Review selected product" onClick={() => { setDetailId(selectedProducts[0] ?? mockProducts[0].id); go("product-detail"); }} secondaryLabel="Start again" onSecondary={reset} />
    </MobileShell>
  );

  return (
    <MobileShell>{<StepHeader onBack={() => go("products")} onExit={reset} label="Product detail" />}
      <section className="product-detail">
        <div className={`detail-pack product-pack--${detailProduct.tone}`}><span>WELA</span><i /></div>
        <p className="screen-kicker">{detailProduct.priority} · Mock product</p><h1>{detailProduct.name}</h1><p className="detail-category">{detailProduct.category}</p><p>{detailProduct.role}</p>
        <dl><div><dt>Place in routine</dt><dd>{detailProduct.usage}</dd></div><div><dt>Illustrative price</dt><dd>฿{detailProduct.price.toLocaleString("en-GB")}</dd></div></dl>
        <div className="detail-rationale"><h2>Why it appears here</h2><p>This typed recommendation responds to your questionnaire selections and the mock visible-breakout summary. It does not treat or diagnose a condition.</p></div>
        <button className={`detail-select ${selectedProducts.includes(detailProduct.id) ? "is-selected" : ""}`} type="button" onClick={() => toggleProduct(detailProduct.id)}>{selectedProducts.includes(detailProduct.id) ? <><Icon name="check" /> Included in mock routine</> : "Add to mock routine"}</button>
        <PrototypeDisclaimer />
      </section><BottomActionBar label="Back to recommendations" onClick={() => go("products")} secondaryLabel="Finish prototype" onSecondary={reset} />
    </MobileShell>
  );
}

function QuestionHeading({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return <section className="question-heading"><p className="screen-kicker">{kicker}</p><h1>{title}</h1><p>{body}</p></section>;
}

function analysisErrorState(error: unknown): AnalysisErrorState {
  if (error instanceof AnalysisApiError) {
    const titles: Record<AnalysisApiError["code"], string> = {
      "invalid-image": "We couldn’t use that image",
      network: "The local service is unavailable",
      timeout: "The analysis took too long",
      validation: "A consultation detail is missing",
      server: "The local analysis could not finish",
      "invalid-response": "The result could not be read",
      configuration: "The analysis service is not configured",
      cancelled: "The analysis was cancelled",
    };
    return { code: error.code, title: titles[error.code], message: error.message, canRetry: !["invalid-image", "validation", "configuration", "cancelled"].includes(error.code) };
  }
  return { code: "server", title: "The local analysis could not finish", message: "An unexpected problem interrupted the analysis. Please try again.", canRetry: true };
}
