import { Kid, MAX_KIDS, validateKids } from "./letter";

const BASE = process.env.DODO_ENV === "live" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

export const PRODUCTS = {
  single: process.env.DODO_PRODUCT_SINGLE ?? "",
  family: process.env.DODO_PRODUCT_FAMILY ?? "",
};

export function dodoConfigured() {
  return Boolean(process.env.DODO_API_KEY && PRODUCTS.single && PRODUCTS.family);
}

async function dodo<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dodo ${path} ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// Kids are stored in payment metadata (one key per child), so no database is needed.
export async function createCheckout(kids: Kid[], returnUrl: string, cancelUrl: string, email?: string) {
  const metadata: Record<string, string> = { app: "little-north-pole", count: String(kids.length) };
  kids.forEach((k, i) => (metadata[`kid${i}`] = JSON.stringify(k)));
  const body: Record<string, unknown> = {
    product_cart: [{ product_id: kids.length > 1 ? PRODUCTS.family : PRODUCTS.single, quantity: 1 }],
    return_url: returnUrl,
    cancel_url: cancelUrl,
    metadata,
  };
  if (email) body.customer = { email };
  return dodo<{ session_id: string; checkout_url: string | null }>("/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

type Payment = {
  payment_id: string;
  status: string | null;
  metadata?: Record<string, string>;
  product_cart?: { product_id: string; quantity: number }[] | null;
  customer?: { email: string; name?: string };
};

export async function getPayment(paymentId: string): Promise<Payment | null> {
  if (!/^[A-Za-z0-9_-]{6,80}$/.test(paymentId)) return null;
  try {
    return await dodo<Payment>(`/payments/${encodeURIComponent(paymentId)}`);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function kidsFromPayment(p: Payment): Kid[] | null {
  if (p.metadata?.app !== "little-north-pole") return null;
  const raw: unknown[] = [];
  for (let i = 0; i < MAX_KIDS; i++) {
    const v = p.metadata?.[`kid${i}`];
    if (!v) continue;
    try {
      raw.push(JSON.parse(v));
    } catch {}
  }
  const { kids, error } = validateKids(raw);
  if (error) return null;
  const paidFamily = p.product_cart?.some((x) => x.product_id === PRODUCTS.family);
  return paidFamily ? kids : kids.slice(0, 1);
}
