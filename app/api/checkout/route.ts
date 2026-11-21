import { NextResponse } from "next/server";
import { validateKids } from "@/lib/letter";
import { createCheckout, dodoConfigured } from "@/lib/dodo";

export const runtime = "nodejs";

function origin(req: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = new Headers(req.headers);
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  if (!dodoConfigured()) {
    return NextResponse.json({ error: "Checkout is being set up. Please try again in a little while." }, { status: 503 });
  }
  let body: { kids?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { kids, error } = validateKids(body.kids);
  if (error) return NextResponse.json({ error }, { status: 422 });

  const email = typeof body.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ? body.email.trim() : undefined;
  const base = origin(req);
  try {
    const session = await createCheckout(kids, `${base}/thank-you`, `${base}/#write`, email);
    if (!session.checkout_url) throw new Error("No checkout_url");
    return NextResponse.json({ url: session.checkout_url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
