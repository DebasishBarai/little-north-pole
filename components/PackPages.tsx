// Lightweight HTML versions of the printed pages, used as product shots.
// Sizes use cqw so each mini page scales with its container, like the PDF.
import { NICE_LIST_NAMES } from "@/lib/letter";

const u = (pt: number, base: number) => `${((pt * 100) / base).toFixed(3)}cqw`;

export function CertificateMini({ name = "Emma", year = 2026 }: { name?: string; year?: number }) {
  const p = (n: number) => u(n, 792);
  return (
    <div className="relative overflow-hidden bg-snow text-center" style={{ containerType: "inline-size", aspectRatio: "792/612" }}>
      <div className="absolute border-gold" style={{ inset: p(20), borderWidth: p(6) }} />
      <div className="absolute border-pine-2" style={{ inset: p(32), borderWidth: p(1.2) }} />
      <div style={{ paddingTop: p(80) }}>
        <div className="font-mono font-bold text-berry" style={{ fontSize: p(10), letterSpacing: "0.5em" }}>OFFICIAL CERTIFICATE</div>
        <div className="font-display leading-none text-pine-2" style={{ fontSize: p(46), marginTop: p(14) }}>Santa&apos;s Nice List</div>
        <div className="font-hand" style={{ fontSize: p(22), marginTop: p(14) }}>This is to certify that</div>
        <div className="font-script text-berry" style={{ fontSize: p(50), lineHeight: 1.6 }}>{name}</div>
        <div className="mx-auto bg-gold" style={{ width: p(400), height: p(1) }} />
        <div className="mx-auto font-hand" style={{ width: p(600), fontSize: p(20), marginTop: p(14), lineHeight: 1.2 }}>
          has been found kind, thoughtful and full of Christmas spirit by the Elves of the North Pole, and is hereby placed on Santa&apos;s Nice List for Christmas {year}.
        </div>
      </div>
      <div className="absolute flex items-end justify-between" style={{ left: p(100), right: p(100), bottom: p(90) }}>
        <div className="border-b border-ink font-script text-berry" style={{ width: p(190), fontSize: p(22), borderBottomWidth: p(0.8) }}>Santa Claus</div>
        <div className="border-b border-ink font-script text-pine-2" style={{ width: p(190), fontSize: p(20), borderBottomWidth: p(0.8) }}>Pepper Minty</div>
      </div>
      <div
        className="absolute grid place-items-center rounded-full bg-gold font-display leading-none text-white"
        style={{ left: "50%", bottom: p(76), width: p(84), height: p(84), transform: "translateX(-50%)", fontSize: p(15), boxShadow: `0 0 0 ${p(7)} #b8902f, 0 0 0 ${p(8.5)} #ecd99a` }}
      >
        <span>NICE<br />LIST</span>
      </div>
    </div>
  );
}

export function NiceListMini({ name = "Emma", city = "Austin, Texas" }: { name?: string; city?: string }) {
  const p = (n: number) => u(n, 612);
  const rows = 17;
  return (
    <div className="relative overflow-hidden bg-snow" style={{ containerType: "inline-size", aspectRatio: "612/792" }}>
      <div className="bg-pine text-center text-white" style={{ height: p(150), paddingTop: p(42) }}>
        <div className="font-mono font-bold text-gold-light" style={{ fontSize: p(8.5), letterSpacing: "0.4em" }}>NORTH POLE RECORDS DEPARTMENT</div>
        <div className="font-display leading-none" style={{ fontSize: p(44), marginTop: p(12) }}>The Nice List</div>
        <div className="font-mono text-gold-light" style={{ fontSize: p(9), marginTop: p(12) }}>Christmas 2026 · Volume XII · Page 1,224</div>
      </div>
      <div className="absolute bg-[#e68c8c]" style={{ left: p(96), top: p(170), bottom: p(40), width: p(1) }} />
      <div style={{ padding: `${p(28)} ${p(40)} 0` }}>
        {Array.from({ length: rows }, (_, r) => {
          const me = r === 6;
          return (
            <div key={r} className="relative flex items-end border-b border-[#c7d6e5]" style={{ height: p(30), borderBottomWidth: p(0.6) }}>
              <span className="font-mono text-ink/40" style={{ width: p(72), fontSize: p(8) }}>{26871 + r}</span>
              {me && <span className="absolute text-gold" style={{ left: p(38), fontSize: p(18), bottom: p(4) }}>★</span>}
              <span
                className={`font-hand ${me ? "bg-[#ffee8c] font-bold text-berry" : ""}`}
                style={{ width: p(218), fontSize: p(me ? 19 : 16), paddingLeft: p(6) }}
              >
                {me ? name : NICE_LIST_NAMES[(r * 7 + 3) % NICE_LIST_NAMES.length]}
              </span>
              <span className={`font-hand ${me ? "font-bold" : "text-ink/80"}`} style={{ width: p(150), fontSize: p(14) }}>
                {me ? city : ["Portland, OR", "Denver, CO", "Raleigh, NC", "Boise, ID", "Tulsa, OK", "Madison, WI"][r % 6]}
              </span>
              <span className={me ? "font-bold text-berry" : "text-pine-2"} style={{ fontSize: p(13) }}>✓✓{me && <span className="font-mono" style={{ fontSize: p(9), marginLeft: p(6) }}>NICE!</span>}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EnvelopeMini({ name = "Emma", city = "Austin, Texas" }: { name?: string; city?: string }) {
  const p = (n: number) => u(n, 684);
  return (
    <div
      className="relative overflow-hidden"
      style={{
        containerType: "inline-size",
        aspectRatio: "684/297",
        background: "repeating-linear-gradient(-45deg,#a8232b 0 3.2cqw,#fdf9f0 3.2cqw 4.6cqw,#1e2b4a 4.6cqw 7.8cqw,#fdf9f0 7.8cqw 9.2cqw)",
      }}
    >
      <div className="absolute bg-snow" style={{ inset: p(14) }}>
        <div className="absolute font-mono leading-tight" style={{ left: p(20), top: p(22), fontSize: p(9) }}>
          <b style={{ fontSize: p(10) }}>SANTA CLAUS</b>
          <br />1 Candy Cane Lane
          <br />North Pole Workshop
          <br />Arctic Circle 00001
        </div>
        <div className="absolute grid place-items-center bg-pine-2 text-[#73a96b]" style={{ right: p(26), top: p(18), width: p(52), height: p(64), outline: `${p(5)} solid white`, fontSize: p(34) }}>▲</div>
        <div className="absolute rounded-full border-[#40475c] opacity-70" style={{ right: p(92), top: p(26), width: p(64), height: p(64), borderWidth: p(1.4) }}>
          <div className="grid h-full place-items-center font-mono font-bold text-[#40475c]" style={{ fontSize: p(9) }}>DEC 24</div>
        </div>
        <div className="absolute" style={{ left: p(316), top: p(110) }}>
          <div className="font-script" style={{ fontSize: p(32) }}>{name}</div>
          <div className="font-hand" style={{ fontSize: p(22), marginTop: p(4) }}>{city}</div>
          <div className="font-hand text-berry" style={{ fontSize: p(16) }}>Open on Christmas Eve!</div>
        </div>
        <div
          className="absolute rotate-[8deg] border-berry text-center font-mono font-bold leading-tight text-berry"
          style={{ left: p(26), bottom: p(34), borderWidth: p(1.8), fontSize: p(10), padding: `${p(5)} ${p(12)}` }}
        >
          SPECIAL DELIVERY
          <br />
          BY REINDEER
        </div>
      </div>
    </div>
  );
}
