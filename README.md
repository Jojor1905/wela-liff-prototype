# Wela LIFF front-end prototype

Mobile-first Next.js prototype for Wela’s skincare consultation flow. The current integration can submit a selected image and questionnaire answers to the local FastAPI `acne_lesion` analysis endpoint. LINE LIFF is not initialised.

## Local configuration

Create `.env.local` in the project root:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_USE_MOCK_ANALYSIS=false
NEXT_PUBLIC_LIFF_ID=
```

`NEXT_PUBLIC_` values are embedded by Next.js at build time. Restart the development server after changing them.

The front end uses mock analysis only when `NEXT_PUBLIC_USE_MOCK_ANALYSIS=true` or `NEXT_PUBLIC_API_BASE_URL` is empty. A failed configured API request is shown to the user and never falls back silently to mock data.

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
- No LINE Login, LIFF SDK, Messaging API, payment, account, or persistent history integration is active.
