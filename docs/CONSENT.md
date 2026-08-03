# Wela Prototype Consent

## Consent principles

Consent must be specific, understandable, freely given, and easy to withdraw where applicable. Required acknowledgement and optional permissions must never be bundled into one checkbox.

- No checkbox, toggle, or permission is selected by default.
- Each choice uses plain, polished English and states its purpose.
- Optional choices do not block access to the prototype.
- Users can cancel, go back, or exit before confirming.
- Refusing optional consent must not create guilt, urgency, or reduced visual prominence.
- The prototype must not claim that consent enables functions that do not yet exist.

## Required one-time prototype consent

Before entering the guided flow, the user must actively acknowledge once per prototype session that:

- Wela is a UI demonstration using typed mock data.
- Results, routines, products, supplements, and prices are simulated.
- The experience does not use a real AI model.
- No real facial image is uploaded, stored, or analysed.

This acknowledgement is required only to ensure that the demonstration cannot be mistaken for a live service. It is not permission for data reuse, marketing, or model training.

## Non-diagnosis acknowledgement

The required acknowledgement must also clearly state that:

- Results are not a medical diagnosis.
- Wela does not identify skin diseases or health conditions.
- The prototype does not replace advice from a qualified medical professional.
- Users with symptoms or health concerns should consult an appropriate licensed professional.

The language should be calm and factual, not alarming.

## Optional history-saving consent

Offer a separate, optional choice for saving answers and mock recommendations in a future service.

For the current prototype:

- The option must be labelled as not yet active.
- No history should be persisted beyond what is technically necessary to show the current in-browser demonstration.
- The copy should explain what types of information could be saved, for what purpose, and how the user could remove it before this feature is implemented.

## Optional LINE follow-up consent

Offer a separate, optional choice for future follow-up through LINE, such as routine reminders or advisor contact.

LINE Login authorisation is handled by LINE when the app opens in the LIFF browser. It permits Wela to show the signed-in user’s display name and optional profile image only. This identity authorisation is separate from photo-analysis acknowledgement, follow-up consent, and marketing consent.

For the current prototype:

- LIFF retrieves only the signed-in user’s display name and optional profile image.
- The optional follow-up choice does not control LINE Login and does not grant photo-analysis permission.
- No message is sent and no Messaging API permission is requested.
- The interface must state that the choice is illustrative and not active.

## Optional marketing consent

Offer marketing consent separately from service follow-up. It must describe the type of content and channel before activation in a future phase.

- Marketing refusal must not block the prototype or advisor path.
- Marketing consent must not be combined with terms, history saving, or LINE service messages.
- Do not use preselected boxes or manipulative copy.

## No model-training consent

There is no model-training consent in this prototype because:

- No real model is used.
- No facial image is uploaded or stored.
- Prototype inputs and outputs must not be collected for training.

Do not show a training-consent checkbox, since that could falsely imply that training or image collection occurs.

## Cancel and exit

The consent screen must provide:

- A clear cancel or exit action before confirmation
- A way to return to the previous explanation
- Confirmation only after the required acknowledgement is actively selected
- No dark patterns, repeated prompts, or misleading button hierarchy

If a user cancels, return them to the welcome screen. Cancelling photo analysis does not alter the separate LINE Login session. Browser behaviour must remain safe and predictable.
