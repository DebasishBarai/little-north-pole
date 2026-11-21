# Checked Twice

A personalized animated Santa video (rendered in the browser, MP4 download) plus printable letter, Nice List certificate, envelope and Nice List page.

- Next.js 16 + Tailwind 4, deployed on Vercel
- Dodo Payments checkout. Letter details live in the payment metadata, so there is no database.
- PDFs are generated on demand with pdf-lib. The video is drawn on a canvas and encoded in the browser (WebCodecs + mp4-muxer, MediaRecorder fallback). No paid APIs.

## Setup

1. In Dodo, create two one-time products: **Single pack** ($14) and **Sibling pack** ($19).
2. Set env vars (see `.env.example`): `DODO_API_KEY`, `DODO_ENV`, `DODO_PRODUCT_SINGLE`, `DODO_PRODUCT_FAMILY`.
3. `npm install && npm run dev`

## Routes

- `/` landing page, form and live preview
- `POST /api/checkout` creates a Dodo checkout session
- `/thank-you?payment_id=...` download page (also lets buyers look up an order)
- `/api/pdf?payment_id=...` paid PDF, `/api/pdf?sample=1` watermarked sample
