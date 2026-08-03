# Wela Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Wela is designed primarily for Thai professionals aged approximately 30 and above, including senior employees, managers, business owners, executives, and CEOs. The interface language is English.

They often have limited time, value privacy and credible guidance, and want concise skincare recommendations. They prefer a short, professional routine connected to their goals and daily life rather than a large product catalogue or trend-driven beauty content.

## Product Purpose

Wela demonstrates a personalised skincare commerce journey that helps a user move from cosmetic skin concerns and lifestyle preferences to:

- A clear morning and evening routine
- Recommended skincare products
- Clearly optional wellness products
- Understandable bundles and prices
- A mock cart and purchase decision
- An optional path to product and routine support from an advisor

The current phase validates the mobile-first experience, information hierarchy, consent model, tone, visual direction, and lightweight LIFF sign-in context. It does not validate clinical accuracy, artificial intelligence, commerce infrastructure, LINE messaging, or persistent LINE identity storage.

Success means that users can understand the simulated recommendation, why each item is suggested, what is essential or optional, how much time the routine takes, and what they can do next—without mistaking the prototype for a live clinical, AI, or commerce service.

## Positioning

Wela frames personalised skincare commerce as a private premium consultation rather than an AI technology demonstration or a large product catalogue. It combines a short guided intake, transparent simulated recommendations, concise routines, clear product rationale, meaningful consent, and user control in one calm journey.

## Operating Context

The current product is a mobile-first web application prototype designed to run in the LINE LIFF browser and in normal mobile or desktop browsers. External browsers remain fully usable in preview mode. LIFF provides only the signed-in user’s display name and optional profile image; no LINE OA messaging capability is active.

The documented journey is:

`Welcome → How it works → Consent → Skin goals → Lifestyle questions → Photo guide → Mock photo preview → Simulated analysis → Result summary → Personal routine → Product bundles → Optional supplements → Mock cart → Consult advisor`

Only the Welcome foundation screen is currently implemented. Later steps remain documented until separately approved.

## Capabilities and Constraints

### Current prototype capabilities

- Mobile-first browser UI and guided user flow
- One-time prototype acknowledgement and separated optional consent choices
- Cosmetic skin-goal and lifestyle questions
- A future-photo preparation guide and local browser preview
- Typed mock skin results and analysis progress
- Typed mock routines, skincare products, supplements, bundles, and prices
- A mock cart with no transaction capability
- Mock advisor actions with no active handoff
- Responsive behaviour for mobile and desktop browsers
- Client-only LIFF initialisation with an external-browser preview fallback
- An in-memory LINE display name and optional profile image after successful login

### Features requiring explicit approval

Do not implement any of the following without explicit approval:

- Real artificial intelligence or machine-learning inference
- Face detection, skin-condition detection, or medical diagnosis
- Backend services, user accounts, production databases, or persistent profiles
- Facial-image upload, cloud storage, processing, analysis, or transmission
- Real checkout, payment gateways, inventory, fulfilment, or subscriptions
- Messaging API, LINE OA messaging, `chat_message.write`, or persistent LINE identity storage
- AI model training, dataset collection, or model-training consent
- Real automated supplement recommendations based on facial images
- Production analytics, marketing automation, or advisor operations

### Image and data rules

- A user-selected facial image may only be previewed locally in the browser during the prototype phase.
- A facial image must never be uploaded, stored, analysed, or transmitted.
- Prototype inputs must not be collected for model training.
- Results, recommendations, products, prices, bundles, cart states, analysis progress, and advisor actions must be clearly labelled as simulated prototype content wherever they could be mistaken for live output.
- Do not display fake AI accuracy values, unsupported scientific scores, diagnostic overlays, or false precision.
- Collect only information needed to demonstrate the current flow.

### Consent rules

- Require active acknowledgement once per prototype session that the experience uses simulated data, does not use a real AI model, does not upload or analyse a real facial image, and does not provide a medical diagnosis.
- Keep optional history saving, future LINE follow-up, and marketing consent separate from the required acknowledgement and from one another.
- Future analysis, marketing, follow-up, and model-development consent must remain separate.
- Do not show model-training consent in this prototype.
- No checkbox, toggle, or permission may be selected by default.
- Refusing an optional choice must not block the prototype or reduce access.
- Provide clear back, cancel, skip where appropriate, and exit paths without pressure or repeated prompts.

### Content and safety rules

- Describe cosmetic goals and general appearance neutrally and respectfully.
- Do not detect or diagnose a disease or health condition.
- Do not make medical, treatment, prevention, or guaranteed-result claims.
- Do not imply that Wela replaces advice from a qualified medical professional.
- Do not criticise the user’s appearance or use fear-based, shaming, scarcity, age-anxious, or alarmist messaging.
- Explain the role, rationale, priority, and optionality of recommendations.
- Present supplements only as optional wellness support, never as conclusions drawn from a facial image.
- Describe advisor support as product and routine guidance, not medical or emergency support.

## Brand Commitments

- Product name: Wela
- Default user-facing interface language: English
- User-facing copy: polished British English
- Code identifiers and file names: English
- Voice: professional, discreet, calm, personal, respectful, and trustworthy
- Experience metaphor: a private premium skincare consultation, never an AI demonstration
- Binding visual direction: premium editorial, quiet luxury, and warm clinical credibility
- Binding palette direction: burgundy, cream, blush, warm taupe, and charcoal
- Avoid neon blue, purple AI gradients, holograms, robots, scanning lasers, diagnostic overlays, excessive glassmorphism, generic SaaS dashboards, and overly technical medical interfaces

The detailed visual system is maintained separately in `DESIGN.md`.

## Evidence on Hand

- `DESIGN.md` — confirmed visual system and design constraints
- `docs/FLOW.md` — confirmed end-to-end journey and implementation boundary
- `docs/CONSENT.md` — confirmed consent, privacy, cancellation, and non-diagnosis rules
- `docs/references/` — moodboard, workflow, business, prototype-flow, and technical reference images
- `src/app/` — current Welcome foundation implementation

Reference assets are design evidence only unless explicitly selected for display. Preserve every file in `docs/references/`; do not move reference images into `public/` or delete them without explicit approval.

There are currently no validated clinical results, real AI outputs, customer testimonials, case studies, production pricing, inventory records, or commerce claims. Future work must not fabricate them.

## Product Principles

1. **Concise guidance over catalogue volume.** Help time-constrained users reach a clear, professional routine and decision.
2. **Trust through transparency.** Label simulations, limitations, data handling, and inactive future capabilities wherever ambiguity could arise.
3. **Privacy and consent are part of the service.** Minimise data, separate permissions, and preserve meaningful user control.
4. **Explain without diagnosing.** Make every recommendation understandable while avoiding medical framing and false certainty.
5. **Human support without pressure.** Offer advisor guidance as an optional continuation, never an emergency path or forced conversion.

## Accessibility & Inclusion

- Use plain, legible English with clear hierarchy and comfortable line lengths.
- Preserve keyboard-visible focus states and touch targets of at least 44 px.
- Ensure adequate colour contrast and do not rely on colour alone to communicate status.
- Respect `prefers-reduced-motion` and avoid decorative delays to important information.
- Keep mobile and desktop browser experiences usable from a minimum width of 320 px.
- Use neutral, non-shaming language that respects age, skin texture, tone, lifestyle, and current routines.
