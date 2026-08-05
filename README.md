# Wela LIFF front-end prototype

Mobile-first Next.js prototype for Wela’s skincare consultation flow. The app initialises LINE LIFF in the browser and can submit a selected image and questionnaire answers to the local FastAPI `acne_lesion` analysis endpoint.

## Local configuration

Copy `.env.local.example` to `.env.local` in the project root, then provide the LIFF ID from the LINE Developers Console:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_USE_MOCK_ANALYSIS=false
NEXT_PUBLIC_LIFF_ID=your-liff-id
```

`NEXT_PUBLIC_` values are embedded by Next.js at build time. Restart the development server after changing them.

The production LIFF endpoint is `https://wela-liff-prototype.vercel.app`. Configure that URL as the LIFF endpoint in the LINE Developers Console and enable only the `profile` scope needed by this prototype. Add `NEXT_PUBLIC_LIFF_ID` to the Vercel project environment before building.

LIFF initialises once when the application starts. Inside the LIFF browser, LINE Login is handled by LIFF and a successful session shows the user’s display name and optional profile image. In localhost and other external browsers, Wela does not force LINE Login: the consultation stays usable in browser preview mode.

The front end retains only `displayName` and `pictureUrl` in React memory. It does not read, store, or log LINE access tokens or ID tokens. No channel secret, Messaging API access token, message permission, `chat_message.write` scope, or Messaging API functionality belongs in this front end.

The front end uses mock analysis only when `NEXT_PUBLIC_USE_MOCK_ANALYSIS=true`. Any other value, including `false` or an unset value, selects real API mode. Real mode requires `NEXT_PUBLIC_API_BASE_URL`; missing configuration or a failed request is shown to the user and never falls back silently to mock data.

## Run locally

Start the FastAPI service on `http://127.0.0.1:8000`, then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Complete the consultation, select a JPEG, PNG, or WEBP image under 10 MB, acknowledge the local analysis, and confirm the preview.

The browser sends multipart form data to `POST /predict` containing `image`, `gender`, `ageRange`, `skinType`, `concerns`, and `goal`.

## Checks

```bash
npm run test:integration
npx tsc --noEmit
npm run lint
npm run build
```

Integration tests mock the FastAPI response and cover multipart submission, response mapping, API failure behaviour, and invalid-image validation.

## Current boundary

- The connected model output is limited to the project class `acne_lesion`.
- Skin type, dark circles, sensitivity, goals, and other concerns remain questionnaire declarations.
- Results are experimental prototype information, not a diagnosis or professional medical advice.
- LINE LIFF and its profile scope are active only for lightweight sign-in context. LINE Login authorisation is separate from photo-analysis consent and the optional future LINE follow-up choice.
- No Messaging API, `chat_message.write`, LINE OA messaging, payment, account, or persistent history integration is active.
