import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Little North Pole: a personal Santa video starring your child";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (p: string) => readFile(join(process.cwd(), "node_modules/@fontsource", p));

export default async function OG() {
  const [serif, hand, mono] = await Promise.all([
    font("young-serif/files/young-serif-latin-400-normal.woff"),
    font("caveat/files/caveat-latin-700-normal.woff"),
    font("courier-prime/files/courier-prime-latin-700-normal.woff"),
  ]);
  const stripes = Array.from({ length: 40 }, (_, i) => (
    <div key={i} style={{ width: 30, height: 14, background: ["#a8232b", "#fdf9f0", "#1e2b4a", "#fdf9f0"][i % 4], transform: "skewX(-40deg)" }} />
  ));
  const flakes = Array.from({ length: 36 }, (_, i) => {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 12345.678) % 1;
    const s = 3 + (i % 4) * 2;
    return <div key={i} style={{ position: "absolute", left: Math.abs(x) * 1200, top: 20 + Math.abs(y) * 600, width: s, height: s, borderRadius: 99, background: "rgba(255,255,255,.55)" }} />;
  });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#14342b", color: "#fdf9f0", position: "relative" }}>
        <div style={{ display: "flex", height: 14, overflow: "hidden" }}>{stripes}</div>
        {flakes}
        <div style={{ display: "flex", flex: 1, padding: "56px 70px", gap: 50, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontFamily: "Mono", fontSize: 20, letterSpacing: 6, color: "#ecd99a" }}>LITTLE NORTH POLE</div>
            <div style={{ fontFamily: "Serif", fontSize: 76, lineHeight: 1.02, marginTop: 22 }}>Santa noticed</div>
            <div style={{ fontFamily: "Hand", fontSize: 64, color: "#ecd99a", lineHeight: 1.1 }}>the good things</div>
            <div style={{ fontFamily: "Serif", fontSize: 76, lineHeight: 1.02 }}>your kid did this year.</div>
            <div style={{ fontFamily: "Hand", fontSize: 34, marginTop: 26, color: "rgba(253,249,240,.85)" }}>A personal Santa video starring your child, plus a printable letter.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 300, height: 300, borderRadius: 300, border: "4px solid #ecd99a", transform: "rotate(-10deg)" }}>
            <div style={{ fontFamily: "Mono", fontSize: 22, color: "#ecd99a", letterSpacing: 4 }}>NICE LIST</div>
            <svg width="150" height="90" viewBox="0 0 150 90" style={{ margin: "10px 0" }}>
              <path d="M10 45 L30 68 L70 16 M80 45 L100 68 L140 16" stroke="#fdf9f0" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontFamily: "Mono", fontSize: 22, color: "#ecd99a", letterSpacing: 4 }}>CHECKED TWICE</div>
            <div style={{ fontFamily: "Serif", fontSize: 30, color: "#fdf9f0", marginTop: 14 }}>from $14</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Serif", data: serif, weight: 400 },
        { name: "Hand", data: hand, weight: 700 },
        { name: "Mono", data: mono, weight: 700 },
      ],
    }
  );
}
