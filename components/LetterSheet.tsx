import { buildLetter, Kid } from "@/lib/letter";

// 1pt in the PDF = 100/612 cqw. Keeps the preview faithful to the printed page.
const pt = (n: number) => `${((n * 100) / 612).toFixed(3)}cqw`;

function Holly({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 48 28" className={className} style={{ width: pt(34), transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <ellipse cx="13" cy="12" rx="12" ry="5" transform="rotate(-25 13 12)" fill="#1d4535" />
      <ellipse cx="35" cy="12" rx="12" ry="5" transform="rotate(25 35 12)" fill="#1d4535" />
      <circle cx="21" cy="17" r="3.6" fill="#a8232b" />
      <circle cx="27.5" cy="16" r="3.6" fill="#a8232b" />
      <circle cx="24" cy="11" r="3.6" fill="#a8232b" />
    </svg>
  );
}

export default function LetterSheet({ kid, variant = 0, watermark = false }: { kid: Kid; variant?: number; watermark?: boolean }) {
  const c = buildLetter(kid, variant);
  return (
    <div className="sheet relative overflow-hidden shadow-[0_30px_60px_-20px_rgba(20,20,10,.45),0_2px_6px_rgba(0,0,0,.12)]">
      <div className="absolute border-pine-2" style={{ inset: pt(22), borderWidth: pt(1.6) }} />
      <div className="absolute border-berry" style={{ inset: pt(29), borderWidth: pt(0.6) }} />
      <div className="absolute" style={{ left: pt(28), top: pt(32) }}><Holly /></div>
      <div className="absolute" style={{ right: pt(28), top: pt(32) }}><Holly flip /></div>

      <div className="relative text-center" style={{ paddingTop: pt(62) }}>
        <div className="font-mono font-bold text-pine-2" style={{ fontSize: pt(8.5), letterSpacing: "0.5em" }}>FROM THE DESK OF</div>
        <div className="font-display text-berry leading-none" style={{ fontSize: pt(36), marginTop: pt(10) }}>Santa Claus</div>
        <div className="font-mono" style={{ fontSize: pt(8.5), marginTop: pt(8) }}>North Pole Workshop · Candy Cane Lane · Arctic Circle</div>
        <div className="mx-auto flex items-center justify-center" style={{ width: pt(312), marginTop: pt(6), gap: pt(6) }}>
          <span className="h-px flex-1 bg-gold" />
          <span className="text-gold" style={{ fontSize: pt(12) }}>★</span>
          <span className="h-px flex-1 bg-gold" />
        </div>
      </div>

      <div className="hand relative" style={{ padding: `${pt(26)} ${pt(78)} 0`, fontSize: pt(17), lineHeight: 1.22 }}>
        <p className="font-bold" style={{ fontSize: pt(22), marginBottom: pt(10) }}>{c.greeting}</p>
        {c.paragraphs.map((p, i) => (
          <p key={i} style={{ marginBottom: pt(9) }}>{p}</p>
        ))}
        <p style={{ marginTop: pt(4) }}>{c.closing}</p>
        <p className="font-script text-berry" style={{ fontSize: pt(26), margin: `${pt(10)} 0 ${pt(14)}` }}>Santa Claus</p>
        <p className="text-pine-2" style={{ paddingRight: pt(100), fontSize: pt(16) }}>{c.ps}</p>
      </div>

      <div className="absolute grid place-items-center rounded-full bg-berry" style={{ right: pt(70), bottom: pt(70), width: pt(68), height: pt(68), boxShadow: `0 0 0 ${pt(5)} #a8232b` }}>
        <div className="grid place-items-center rounded-full border-berry-deep font-display text-[#f5d1cc]" style={{ width: pt(50), height: pt(50), borderWidth: pt(1.6), fontSize: pt(20) }}>SC</div>
      </div>

      {watermark && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="font-display text-berry/10 -rotate-[30deg] select-none" style={{ fontSize: pt(110) }}>PREVIEW</span>
        </div>
      )}
    </div>
  );
}
