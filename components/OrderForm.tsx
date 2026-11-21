"use client";
import { useState } from "react";
import LetterSheet from "./LetterSheet";
import VideoPlayer from "./VideoPlayer";
import { emptyKid, Kid, LIMITS, MAX_KIDS, SAMPLE_KID, validateKids } from "@/lib/letter";

type FieldDef = { key: keyof Kid; label: string; placeholder: string; hint?: string; optional?: boolean; half?: boolean };

const FIELDS: FieldDef[] = [
  { key: "name", label: "First name", placeholder: "Emma", half: true },
  { key: "age", label: "Age", placeholder: "6", half: true, optional: true },
  {
    key: "deed",
    label: "One good thing they did this year",
    placeholder: "helped your little brother learn to tie his shoes",
    hint: "Write it the way Santa would say it to them. Start with a word like helped, shared, tried or was brave.",
  },
  { key: "wish", label: "What they're wishing for", placeholder: "a sparkly purple bike with a bell" },
  { key: "goal", label: "Something they're working on", placeholder: "being brave at the dentist", optional: true },
  { key: "city", label: "Hometown", placeholder: "Austin, Texas", half: true, optional: true },
  { key: "pet", label: "Pet's name", placeholder: "Biscuit", half: true, optional: true },
];

export default function OrderForm() {
  const [kids, setKids] = useState<Kid[]>([emptyKid()]);
  const [active, setActive] = useState(0);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"video" | "letter">("video");

  const kid = kids[active];
  const family = kids.length > 1;
  const price = family ? 19 : 14;

  // Preview falls back to the sample so the page never looks empty.
  const started = Object.values(kid).some(Boolean);
  const previewKid: Kid = started
    ? { ...kid, name: kid.name || "Little One", deed: kid.deed || SAMPLE_KID.deed, wish: kid.wish || SAMPLE_KID.wish }
    : active === 0
      ? SAMPLE_KID
      : { ...SAMPLE_KID, name: "Leo", age: "4", deed: "shared your favorite truck with a new friend at preschool", goal: "", wish: "a dinosaur that roars", pet: "" };

  const update = (key: keyof Kid, value: string) => {
    setError("");
    setKids((ks) => ks.map((k, i) => (i === active ? { ...k, [key]: key === "age" ? value.replace(/\D/g, "").slice(0, 2) : value } : k)));
  };

  const addKid = () => {
    if (kids.length >= MAX_KIDS) return;
    setKids((ks) => [...ks, { ...emptyKid(), city: ks[0].city }]);
    setActive(kids.length);
  };

  const removeKid = (i: number) => {
    setKids((ks) => ks.filter((_, j) => j !== i));
    setActive(0);
  };

  async function checkout() {
    const { error } = validateKids(kids);
    if (error) {
      setError(error);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kids, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      {/* form */}
      <div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {kids.map((k, i) => (
            <div key={i} className="group relative">
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`rounded-full border-2 px-4 py-1.5 font-mono text-sm font-bold transition ${
                  i === active ? "border-ink bg-ink text-snow" : "border-ink/25 text-ink/70 hover:border-ink/60"
                }`}
              >
                {k.name || `Child ${i + 1}`}
              </button>
              {kids.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove ${k.name || `child ${i + 1}`}`}
                  onClick={() => removeKid(i)}
                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 place-items-center rounded-full bg-berry text-xs text-white group-hover:grid"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {kids.length < MAX_KIDS && (
            <button type="button" onClick={addKid} className="rounded-full border-2 border-dashed border-berry/50 px-4 py-1.5 font-mono text-sm font-bold text-berry hover:border-berry">
              + Add a sibling {kids.length === 1 && <span className="font-normal opacity-75">(+$5)</span>}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          {FIELDS.map((f) => (
            <label key={f.key} className={f.half ? "col-span-1" : "col-span-2"}>
              <span className="label text-pine-2">
                {f.label}
                {f.optional && <span className="ml-2 font-normal normal-case tracking-normal text-ink/45">optional</span>}
              </span>
              <input
                className="field"
                value={kid[f.key]}
                maxLength={LIMITS[f.key]}
                inputMode={f.key === "age" ? "numeric" : undefined}
                placeholder={f.placeholder}
                onChange={(e) => update(f.key, e.target.value)}
              />
              {f.hint && <span className="mt-1.5 block text-[15px] italic leading-snug text-ink/60">{f.hint}</span>}
            </label>
          ))}
          <label className="col-span-2">
            <span className="label text-pine-2">
              Your email <span className="ml-2 font-normal normal-case tracking-normal text-ink/45">for your receipt</span>
            </span>
            <input className="field" type="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>

        <div className="mt-10 rounded-sm border-2 border-ink bg-snow p-5 shadow-[6px_6px_0_var(--color-ink)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="label text-berry">{family ? `Sibling pack · ${kids.length} children` : "Single pack"}</div>
              <div className="mt-1 text-[15px] leading-snug text-ink/70">
                {family ? `${kids.length} Santa videos, ${kids.length} letters, certificates and envelopes + the Nice List page` : "Santa video + letter, certificate, envelope and the Nice List page"}
              </div>
            </div>
            <div className="font-display text-4xl leading-none">${price}</div>
          </div>
          <button
            type="button"
            onClick={checkout}
            disabled={busy}
            className="mt-5 w-full rounded-sm bg-berry px-6 py-4 font-mono text-[15px] font-bold uppercase tracking-[0.14em] text-snow transition hover:bg-berry-deep disabled:opacity-60"
          >
            {busy ? "Opening the mail slot..." : `Send to Santa's desk · $${price}`}
          </button>
          {error && <p className="mt-3 text-[15px] text-berry">{error}</p>}
          <p className="mt-3 text-center text-[13px] text-ink/55">Watch and download right after checkout. Print the extras tonight.</p>
        </div>
      </div>

      {/* live preview */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1 rounded-full border-2 border-ink/15 p-1">
            {(["video", "letter"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] transition ${view === v ? "bg-ink text-snow" : "text-ink/60 hover:text-ink"}`}
              >
                {v === "video" ? "Santa video" : "Letter"}
              </button>
            ))}
          </div>
          <span className="font-hand text-xl text-berry">updates as you type ↓</span>
        </div>
        {view === "video" ? (
          <VideoPlayer kid={previewKid} watermark posterAt={11.5} />
        ) : (
          <div className="rotate-[1.2deg]">
            <LetterSheet kid={previewKid} variant={active} watermark />
          </div>
        )}
      </div>
    </div>
  );
}
