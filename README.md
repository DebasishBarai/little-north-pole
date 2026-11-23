# Little North Pole

A personalized animated Santa video (rendered in the browser, MP4 download) plus printable letter, Nice List certificate, envelope and Nice List page.

- Next.js 16 + Tailwind 4, deployed on Vercel
- Polar checkout. Letter details live in the checkout and order metadata, so there is no database.
- PDFs are generated on demand with pdf-lib. The video is drawn on a canvas and encoded in the browser (WebCodecs + mp4-muxer, MediaRecorder fallback). No paid APIs.

## Setup

1. In Polar, create two one-time products: **Single pack** ($14) and **Sibling pack** ($19).
2. Set env vars (see `.env.example`): `POLAR_ACCESS_TOKEN`, `POLAR_ENV`, `POLAR_PRODUCT_SINGLE`, `POLAR_PRODUCT_FAMILY`.
3. `npm install && npm run dev`

## Routes

- `/` landing page, form and live preview
- `POST /api/checkout` creates a Polar checkout session
- `/thank-you?checkout_id=...` download page (also lets buyers look up an order)
- `/api/pdf?id=...` paid PDF, `/api/pdf?sample=1` watermarked sample
