# Wela Prototype Flow

## Flow principles

- Keep each step focused on one decision or one small group of related inputs.
- Show progress without pressuring the user to finish.
- Use plain, polished English and explain why personal information is requested.
- Clearly distinguish required actions from optional choices.
- Label every simulated result and commerce state as prototype content.
- Provide back, cancel, and exit paths where appropriate.
- Do not imply diagnosis, clinical measurement, or image storage.

## End-to-end flow

### 1. Welcome

Introduce Wela as a personalised skincare prototype with a premium, calm tone. Clearly label the experience as simulated. Primary action: start. Secondary action: see how it works.

When opened inside the LIFF browser, initialise LINE Login context and show a subtle profile header only after login and profile retrieval succeed. In an external browser, keep the full prototype usable and label it as browser preview mode. LINE identity remains separate from all photo-analysis and optional follow-up consent.

### 2. How it works

Explain the short journey: share goals, answer lifestyle questions, review a mock photo preview, and receive a simulated routine. Reinforce privacy and non-diagnostic limitations.

### 3. Consent

Present the required one-time prototype acknowledgement separately from optional permissions. No option is preselected. Users can cancel or exit without continuing.

### 4. Skin goals

Ask users to choose cosmetic skincare goals in neutral language, such as hydration, comfortable-feeling skin, more even-looking tone, or a simpler routine. Do not offer medical conditions as selections.

### 5. Lifestyle questions

Collect only inputs needed to personalise the mock routine, such as time available, current routine complexity, environment, and preferences. Avoid unnecessary health or sensitive questions.

### 6. Photo guide

Explain how a future photo-assisted experience could be prepared. State that this prototype does not upload, store, or analyse a real facial image.

The implemented photo preparation screen is available at `/skin-check/photo`. Its visual actions are illustrative only: it does not request camera permission, accept an image, or create a preview.

### 7. Mock photo preview

Display an illustrative local placeholder or staged mock preview. It must not accept an upload or imply that processing has occurred. Provide a clear option to continue or go back.

### 8. Simulated analysis

Show a short, calm transition based entirely on typed mock data. Use explicit copy such as “Preparing your simulated results”. Do not use scanners, diagnostic maps, scores, or false precision.

### 9. Result summary

Summarise selected goals and lifestyle context, then provide a small number of neutral, actionable observations. Label the summary as simulated and not a medical diagnosis.

### 10. Personal routine

Present a simple morning and evening mock routine. Explain sequence, purpose, and approximate time. Distinguish essentials from optional steps.

### 11. Product bundles

Offer a small number of typed mock bundles organised around convenience and preference. Include mock prices and rationale. Avoid claiming guaranteed outcomes.

### 12. Optional supplements

Place supplements in a clearly optional section after topical skincare. Avoid treatment, prevention, or health claims. Include a reminder to seek qualified advice when relevant.

### 13. Mock cart

Allow users to review illustrative selections and totals. Clearly state that no purchase, payment, reservation, or inventory action will occur.

### 14. Consult advisor

Offer a future path to speak with an advisor for product and routine support. Clarify that this is not medical or emergency support and that LINE follow-up is not active in the prototype.

## Flow map

`Welcome → How it works → Consent → Skin goals → Lifestyle questions → Photo guide → Mock photo preview → Simulated analysis → Result summary → Personal routine → Product bundles → Optional supplements → Mock cart → Consult advisor`

Only the Welcome foundation screen and the Photo guide preparation screen are implemented in the first phase. All later steps remain documentation until separately approved.
