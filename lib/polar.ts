import { Kid, LIMITS, MAX_KIDS, validateKids } from "./letter";

const BASE = process.env.POLAR_ENV === "sandbox" ? "https://sandbox-api.polar.sh/v1" : "https://api.polar.sh/v1";

export const PRODUCTS = {
  single: process.env.POLAR_PRODUCT_SINGLE ?? "",
  family: process.env.POLAR_PRODUCT_FAMILY ?? "",
};

export function polarConfigured() {
  return Boolean(process.env.POLAR_ACCESS_TOKEN && PRODUCTS.single && PRODUCTS.family);
}

class PolarError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function polar<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      "Polar-Version": "2026-10",
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new PolarError(res.status, `Polar ${path} ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

const FIELDS = Object.keys(LIMITS) as (keyof Kid)[];

// Kids are stored in checkout metadata, one key per field (k0_name, k0_deed, ...),
// so every value stays well under Polar's 500 character limit. Polar copies it to the order. No database needed.
export async function createCheckout(kids: Kid[], successUrl: string, returnUrl: string, email?: string) {
  const metadata: Record<string, string> = { app: "little-north-pole", count: String(kids.length) };
  kids.forEach((k, i) => FIELDS.forEach((f) => k[f] && (metadata[`k${i}_${f}`] = k[f])));
  const body: Record<string, unknown> = {
    products: [kids.length > 1 ? PRODUCTS.family : PRODUCTS.single],
    success_url: successUrl,
    return_url: returnUrl,
    metadata,
  };
  if (email) body.customer_email = email;
  return polar<{ id: string; url: string }>("/checkouts/", { method: "POST", body: JSON.stringify(body) });
}

export type Purchase = {
  id: string;
  state: "paid" | "pending" | "failed";
  productId?: string;
  metadata: Record<string, unknown>;
};

type CheckoutRes = { id: string; status: string; product_id?: string; product?: { id: string }; metadata?: Record<string, unknown> };
type OrderRes = { id: string; status: string; paid?: boolean; product_id?: string; metadata?: Record<string, unknown> };

// Accepts a checkout ID (from the success redirect) or an order ID (from Polar's receipt or customer portal).
export async function getPurchase(id: string): Promise<Purchase | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  try {
    const c = await polar<CheckoutRes>(`/checkouts/${encodeURIComponent(id)}`);
    const state = c.status === "succeeded" ? "paid" : ["failed", "expired"].includes(c.status) ? "failed" : "pending";
    return { id: c.id, state, productId: c.product_id ?? c.product?.id, metadata: c.metadata ?? {} };
  } catch (e) {
    if (!(e instanceof PolarError && e.status === 404)) {
      console.error(e);
      return null;
    }
  }
  try {
    const o = await polar<OrderRes>(`/orders/${encodeURIComponent(id)}`);
    const paid = o.status === "paid" || o.status === "partially_refunded";
    const state = paid ? "paid" : ["refunded", "void"].includes(o.status) ? "failed" : "pending";
    return { id: o.id, state, productId: o.product_id, metadata: o.metadata ?? {} };
  } catch (e) {
    if (!(e instanceof PolarError && e.status === 404)) console.error(e);
    return null;
  }
}

export function kidsFromPurchase(p: Purchase): Kid[] | null {
  if (p.metadata.app !== "little-north-pole") return null;
  const raw: Record<string, unknown>[] = [];
  for (let i = 0; i < MAX_KIDS; i++) {
    const kid: Record<string, unknown> = {};
    FIELDS.forEach((f) => (kid[f] = p.metadata[`k${i}_${f}`] ?? ""));
    if (kid.name) raw.push(kid);
  }
  const { kids, error } = validateKids(raw);
  if (error) return null;
  return p.productId === PRODUCTS.family ? kids : kids.slice(0, 1);
}
