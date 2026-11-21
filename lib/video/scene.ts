// Deterministic Santa video: draw(ctx, t) renders the frame at time t (seconds).
// The same function drives live playback and offline MP4 export.
import type { Kid } from "../letter";
import { christmasYear, NICE_LIST_NAMES } from "../letter";

export const W = 1280;
export const H = 720;
export const FPS = 30;
export const DURATION = 51.2; // two passes of the tune at 150 bpm

// scene boundaries
export const T = { book: 7, report: 16, wish: 25, sleigh: 33, santa: 42 };

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const C = {
  night: "#081826",
  night2: "#123247",
  pine: "#14342b",
  pine2: "#1d4535",
  berry: "#a8232b",
  berryDeep: "#7a1419",
  gold: "#e8c766",
  goldDeep: "#b8902f",
  snow: "#fdf9f0",
  ink: "#1e2b4a",
  paper: "#f8f1e3",
  skin: "#f2c4a0",
  green: "#1d6b45",
};

const F = {
  serif: (s: number) => `${s}px "Young Serif", Georgia, serif`,
  hand: (s: number, w = 500) => `${w} ${s}px Caveat, cursive`,
  script: (s: number) => `${s}px "Homemade Apple", cursive`,
  mono: (s: number, w = 700) => `${w} ${s}px "Courier Prime", monospace`,
};

export const FONT_LOADS = [F.serif(40), F.hand(40), F.hand(40, 700), F.script(40), F.mono(20), F.mono(20, 400)];

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x: number) => {
  x = clamp(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const back = (x: number) => {
  x = clamp(x);
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const bounce = (x: number) => {
  x = clamp(x);
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- text helpers ----------

function wrapLines(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      out.push(line);
      line = w;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

function fitFont(ctx: Ctx, text: string, font: (s: number) => string, size: number, maxW: number) {
  let s = size;
  ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 12) {
    s -= 2;
    ctx.font = font(s);
  }
  return s;
}

function caption(ctx: Ctx, text: string, y: number, a: number, opts: { size?: number; color?: string; font?: (s: number) => string; rise?: number } = {}) {
  if (a <= 0) return;
  const { size = 46, color = C.snow, font = F.serif, rise = 14 } = opts;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  fitFont(ctx, text, font, size, W - 160);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,.45)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y + (1 - easeOut(a)) * rise);
  ctx.restore();
}

// ---------- shared art ----------

function nightSky(ctx: Ctx, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#050f1a");
  g.addColorStop(0.55, C.night2);
  g.addColorStop(1, "#1f5266");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 140; i++) {
    const x = rand(i, 1) * W, y = rand(i, 2) * H * 0.6;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1 + rand(i, 3) * 2) + i));
    ctx.globalAlpha = tw * (0.4 + rand(i, 4) * 0.6);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + rand(i, 5) * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function aurora(ctx: Ctx, t: number, strength = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const bands = [
    { base: 150, amp: 34, col: "rgba(80,230,170,", w: 90, sp: 0.5 },
    { base: 210, amp: 26, col: "rgba(60,190,220,", w: 70, sp: 0.38 },
    { base: 120, amp: 40, col: "rgba(140,120,240,", w: 60, sp: 0.62 },
  ];
  bands.forEach((b, k) => {
    for (let pass = 0; pass < 3; pass++) {
      ctx.beginPath();
      for (let x = -40; x <= W + 40; x += 30) {
        const y = b.base + Math.sin(x * 0.0055 + t * b.sp + k * 2) * b.amp + Math.sin(x * 0.013 - t * 0.3) * 12;
        if (x === -40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `${b.col}${(0.07 * strength).toFixed(3)})`;
      ctx.lineWidth = b.w * (1 - pass * 0.3);
      ctx.lineCap = "round";
      ctx.stroke();
    }
  });
  ctx.restore();
}

function hills(ctx: Ctx, t: number, tint = "#e9f1f5") {
  ctx.fillStyle = "#c9dbe4";
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, 560);
  ctx.quadraticCurveTo(260, 500, 520, 575);
  ctx.quadraticCurveTo(820, 640, 1060, 560);
  ctx.quadraticCurveTo(1180, 525, W, 545);
  ctx.lineTo(W, H);
  ctx.fill();
  // pines on the far hill
  for (let i = 0; i < 16; i++) {
    const x = 30 + i * 82 + rand(i, 9) * 30;
    const s = 0.6 + rand(i, 8) * 0.6;
    const y = 590 - Math.sin(x * 0.006) * 20;
    tree(ctx, x, y, s, "#20453a");
  }
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, 640);
  ctx.quadraticCurveTo(380, 590, 700, 650);
  ctx.quadraticCurveTo(1000, 700, W, 630);
  ctx.lineTo(W, H);
  ctx.fill();
}

function tree(ctx: Ctx, x: number, y: number, s: number, col: string) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y - 90 * s);
  ctx.lineTo(x - 26 * s, y - 40 * s);
  ctx.lineTo(x - 14 * s, y - 40 * s);
  ctx.lineTo(x - 34 * s, y);
  ctx.lineTo(x + 34 * s, y);
  ctx.lineTo(x + 14 * s, y - 40 * s);
  ctx.lineTo(x + 26 * s, y - 40 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.beginPath();
  ctx.moveTo(x, y - 90 * s);
  ctx.lineTo(x - 10 * s, y - 72 * s);
  ctx.lineTo(x + 10 * s, y - 72 * s);
  ctx.fill();
}

function snow(ctx: Ctx, t: number, n = 90, alpha = 0.85) {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < n; i++) {
    const sp = 26 + rand(i, 3) * 55;
    const r = 1.2 + rand(i, 4) * 3.2;
    const x = (rand(i, 1) * W + Math.sin(t * 0.7 + i) * 22 + W) % W;
    const y = ((rand(i, 2) * (H + 40) + t * sp) % (H + 40)) - 20;
    ctx.globalAlpha = alpha * (0.35 + rand(i, 5) * 0.65);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function star(ctx: Ctx, x: number, y: number, r: number, col: string, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function sparkles(ctx: Ctx, x: number, y: number, p: number, n = 10, spread = 120, col = C.gold) {
  if (p <= 0 || p >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand(i, 7);
    const d = easeOut(p) * spread * (0.6 + rand(i, 6) * 0.6);
    ctx.globalAlpha = 1 - p;
    star(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 6 + rand(i, 2) * 8, col, p * 3);
  }
  ctx.globalAlpha = 1;
}

function check(ctx: Ctx, x: number, y: number, s: number, p: number, col: string) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 6 * s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const pts = [
    [x, y],
    [x + 12 * s, y + 13 * s],
    [x + 36 * s, y - 20 * s],
  ];
  const l1 = Math.hypot(12, 13), l2 = Math.hypot(24, 33), tot = l1 + l2;
  const d = p * tot;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  if (d <= l1) {
    const k = d / l1;
    ctx.lineTo(x + 12 * s * k, y + 13 * s * k);
  } else {
    ctx.lineTo(pts[1][0], pts[1][1]);
    const k = (d - l1) / l2;
    ctx.lineTo(pts[1][0] + 24 * s * k, pts[1][1] - 33 * s * k);
  }
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function stamp(ctx: Ctx, text: string[], x: number, y: number, p: number, col: string, rot: number) {
  if (p <= 0) return;
  const s = 1 + (1 - back(p)) * 1.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalAlpha = clamp(p * 3) * 0.92;
  ctx.font = F.mono(40);
  const w = Math.max(...text.map((l) => ctx.measureText(l).width)) + 56;
  const h = text.length * 46 + 28;
  ctx.strokeStyle = col;
  ctx.lineWidth = 6;
  roundRect(ctx, -w / 2, -h / 2, w, h, 10);
  ctx.stroke();
  ctx.lineWidth = 2;
  roundRect(ctx, -w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 6);
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  text.forEach((l, i) => ctx.fillText(l, 0, -((text.length - 1) * 46) / 2 + i * 46 + 2));
  ctx.restore();
}

// ---------- characters ----------

function santa(ctx: Ctx, x: number, y: number, s: number, t: number, mouthOpen: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // body
  ctx.fillStyle = C.berry;
  ctx.beginPath();
  ctx.moveTo(-120, 70);
  ctx.quadraticCurveTo(-210, 220, -200, 420);
  ctx.lineTo(200, 420);
  ctx.quadraticCurveTo(210, 220, 120, 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-24, 120, 48, 300);
  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(-196, 280, 392, 44);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 8;
  ctx.strokeRect(-34, 284, 68, 36);
  // resting arm
  ctx.fillStyle = C.berryDeep;
  ctx.beginPath();
  ctx.ellipse(-170, 230, 46, 110, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-150, 330, 44, 22, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // beard (behind face bottom)
  ctx.fillStyle = "#fff";
  const beard: [number, number, number][] = [
    [-70, 40, 62], [70, 40, 62], [0, 70, 78], [-50, 110, 60], [50, 110, 60], [0, 150, 62], [-25, 185, 40], [25, 185, 40], [-95, 10, 40], [95, 10, 40],
  ];
  // face
  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.arc(0, -10, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  beard.forEach(([bx, by, r]) => {
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#e6e9ee";
  ctx.beginPath();
  ctx.arc(0, 175, 30, 0, Math.PI * 2);
  ctx.fill();
  // mouth
  if (mouthOpen > 0.05) {
    ctx.fillStyle = "#5a1414";
    ctx.beginPath();
    ctx.ellipse(0, 52, 20, 6 + mouthOpen * 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // cheeks
  ctx.fillStyle = "rgba(232,110,110,.45)";
  ctx.beginPath();
  ctx.arc(-46, 10, 18, 0, Math.PI * 2);
  ctx.arc(46, 10, 18, 0, Math.PI * 2);
  ctx.fill();
  // mustache
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#d9dde3";
  ctx.lineWidth = 2;
  [-1, 1].forEach((d) => {
    ctx.beginPath();
    ctx.ellipse(d * 34, 34, 40, 18, d * -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  // nose
  ctx.fillStyle = "#e58f7c";
  ctx.beginPath();
  ctx.arc(0, 16, 17, 0, Math.PI * 2);
  ctx.fill();
  // eyes: happy arcs, with a blink
  const blink = (t % 3.4) < 0.12;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  [-1, 1].forEach((d) => {
    ctx.beginPath();
    if (blink) {
      ctx.moveTo(d * 32 - 12, -18);
      ctx.lineTo(d * 32 + 12, -18);
    } else ctx.arc(d * 32, -12, 12, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  });
  // eyebrows
  ctx.fillStyle = "#fff";
  [-1, 1].forEach((d) => {
    ctx.beginPath();
    ctx.ellipse(d * 34, -40, 24, 10, d * 0.15, 0, Math.PI * 2);
    ctx.fill();
  });
  // hat
  ctx.fillStyle = C.berry;
  ctx.beginPath();
  ctx.moveTo(-88, -60);
  ctx.quadraticCurveTo(-60, -200, 40, -215);
  ctx.quadraticCurveTo(150, -220, 170, -120);
  ctx.quadraticCurveTo(120, -150, 88, -60);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(172, -112, 28, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, -100, -88, 200, 46, 23);
  ctx.fill();
  // waving arm (in front)
  const ang = 0.55 + Math.sin(t * 7) * 0.3;
  ctx.save();
  ctx.translate(150, 120);
  ctx.rotate(ang);
  ctx.fillStyle = C.berry;
  roundRect(ctx, -28, -170, 60, 190, 30);
  ctx.fill();
  ctx.fillStyle = "#fff";
  roundRect(ctx, -34, -182, 72, 34, 17);
  ctx.fill();
  ctx.fillStyle = "#f4f1ea";
  ctx.beginPath();
  ctx.arc(2, -206, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-28, -196, 13, 21, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function reindeer(ctx: Ctx, x: number, y: number, s: number, t: number, rudolph = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const g = Math.sin(t * 12);
  ctx.strokeStyle = "#6b4227";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  // legs
  [[-28, g], [-14, -g], [18, -g], [32, g]].forEach(([lx, k]) => {
    ctx.beginPath();
    ctx.moveTo(lx, 10);
    ctx.lineTo(lx + 14 * k, 44);
    ctx.stroke();
  });
  ctx.fillStyle = "#8a5a36";
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // neck + head
  ctx.beginPath();
  ctx.ellipse(46, -24, 12, 26, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(62, -42, 20, 13, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // antlers
  ctx.strokeStyle = "#d8b98a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(56, -52);
  ctx.lineTo(48, -82);
  ctx.moveTo(51, -70);
  ctx.lineTo(38, -78);
  ctx.moveTo(62, -54);
  ctx.lineTo(68, -84);
  ctx.moveTo(66, -72);
  ctx.lineTo(78, -80);
  ctx.stroke();
  // nose
  ctx.fillStyle = rudolph ? "#ff3b3b" : "#3a2414";
  ctx.beginPath();
  ctx.arc(81, -40, rudolph ? 7 : 5, 0, Math.PI * 2);
  ctx.fill();
  if (rudolph) {
    const glow = ctx.createRadialGradient(81, -40, 2, 81, -40, 34);
    glow.addColorStop(0, "rgba(255,80,80,.7)");
    glow.addColorStop(1, "rgba(255,80,80,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(81, -40, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function sleigh(ctx: Ctx, x: number, y: number, s: number, t: number, ang: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(s, s);
  // reins
  ctx.strokeStyle = "rgba(232,199,102,.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, -20);
  ctx.lineTo(150, -10);
  ctx.lineTo(260, -10);
  ctx.stroke();
  reindeer(ctx, 170, 0, 0.8, t);
  reindeer(ctx, 280, 0, 0.8, t + 0.4, true);
  // santa bump + sack
  ctx.fillStyle = "#8b5a2b";
  ctx.beginPath();
  ctx.arc(-40, -40, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.berry;
  ctx.beginPath();
  ctx.arc(5, -44, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.arc(8, -70, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.berry;
  ctx.beginPath();
  ctx.moveTo(-6, -78);
  ctx.lineTo(22, -80);
  ctx.lineTo(4, -102);
  ctx.fill();
  // body
  ctx.fillStyle = C.berry;
  ctx.beginPath();
  ctx.moveTo(-80, -30);
  ctx.lineTo(40, -30);
  ctx.quadraticCurveTo(60, -30, 56, 0);
  ctx.lineTo(-60, 4);
  ctx.quadraticCurveTo(-92, 0, -80, -30);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-70, 14);
  ctx.lineTo(56, 14);
  ctx.quadraticCurveTo(76, 12, 72, -6);
  ctx.moveTo(-40, 4);
  ctx.lineTo(-40, 14);
  ctx.moveTo(30, 4);
  ctx.lineTo(30, 14);
  ctx.stroke();
  ctx.restore();
  // magic trail
  for (let i = 0; i < 14; i++) {
    const k = i / 14;
    ctx.globalAlpha = (1 - k) * 0.8;
    star(ctx, x - 60 - i * 18 + Math.sin(t * 8 + i) * 4, y + Math.sin(t * 5 + i) * 8, 4 * (1 - k) + 1, C.gold, t + i);
  }
  ctx.globalAlpha = 1;
}

function house(ctx: Ctx, x: number, y: number, s: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const glow = ctx.createRadialGradient(0, -30, 10, 0, -30, 160);
  glow.addColorStop(0, `rgba(255,214,120,${0.45 + Math.sin(t * 3) * 0.08})`);
  glow.addColorStop(1, "rgba(255,214,120,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, -30, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3b2a2a";
  ctx.fillRect(28, -118, 20, 40);
  ctx.fillStyle = "#6e3b2b";
  ctx.fillRect(-60, -60, 120, 70);
  ctx.fillStyle = "#2a1c1c";
  ctx.beginPath();
  ctx.moveTo(-78, -56);
  ctx.lineTo(0, -120);
  ctx.lineTo(78, -56);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(-82, -54);
  ctx.lineTo(0, -122);
  ctx.lineTo(82, -54);
  ctx.lineTo(70, -50);
  ctx.lineTo(0, -106);
  ctx.lineTo(-70, -50);
  ctx.fill();
  ctx.fillStyle = "#ffd36b";
  ctx.fillRect(-40, -40, 26, 24);
  ctx.fillRect(14, -40, 26, 24);
  ctx.fillStyle = "#4a2e22";
  ctx.fillRect(-10, -22, 20, 32);
  ctx.restore();
}

function gift(ctx: Ctx, x: number, y: number, s: number, lidLift: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 110, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.berry;
  ctx.fillRect(-95, -150, 190, 150);
  ctx.fillStyle = C.gold;
  ctx.fillRect(-14, -150, 28, 150);
  ctx.save();
  ctx.translate(0, -150 - lidLift * 40);
  ctx.rotate(-lidLift * 0.15);
  ctx.fillStyle = "#c0303a";
  ctx.fillRect(-106, -36, 212, 38);
  ctx.fillStyle = C.gold;
  ctx.fillRect(-14, -36, 28, 38);
  ctx.beginPath();
  ctx.ellipse(-32, -50, 34, 18, -0.4, 0, Math.PI * 2);
  ctx.ellipse(32, -50, 34, 18, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.goldDeep;
  ctx.beginPath();
  ctx.arc(0, -44, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function quill(ctx: Ctx, x: number, y: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.7 + Math.sin(t * 22) * 0.05);
  ctx.fillStyle = "#f4f1ea";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-26, -70, 8, -150);
  ctx.quadraticCurveTo(30, -70, 0, 0);
  ctx.fill();
  ctx.strokeStyle = "#b9b2a4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(7, -140);
  ctx.stroke();
  ctx.restore();
}

// ---------- scenes ----------

function sceneIntro(ctx: Ctx, t: number, kid: Kid) {
  nightSky(ctx, t);
  aurora(ctx, t);
  hills(ctx, t);
  // signpost
  ctx.save();
  ctx.translate(1080, 650);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? "#fff" : C.berry;
    ctx.fillRect(-8, -i * 24 - 24, 16, 24);
  }
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.arc(0, -246, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6b4227";
  ctx.fillRect(-120, -210, 150, 40);
  ctx.fillStyle = "#fff";
  ctx.font = F.mono(18);
  ctx.textAlign = "center";
  ctx.fillText("NORTH POLE", -45, -184);
  ctx.restore();

  caption(ctx, "A special delivery from", 210, prog(t, 0.6, 1.5), { size: 40, color: "#cfe6ee" });
  caption(ctx, "the North Pole", 270, prog(t, 1.1, 2.0), { size: 64 });
  caption(ctx, "for", 345, prog(t, 2.4, 3.0), { size: 34, font: F.hand, color: "#cfe6ee" });
  const nameP = prog(t, 2.8, 3.8);
  if (nameP > 0) {
    ctx.save();
    ctx.globalAlpha = nameP;
    ctx.translate(W / 2, 430);
    const sc = 0.6 + back(nameP) * 0.4;
    ctx.scale(sc, sc);
    fitFont(ctx, kid.name, F.script, 92, 900);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(232,199,102,.6)";
    ctx.shadowBlur = 30;
    ctx.fillStyle = C.gold;
    ctx.fillText(kid.name, 0, 0);
    ctx.restore();
  }
  sparkles(ctx, W / 2, 430, prog(t, 3.0, 4.4), 14, 260);
}

function sceneBook(ctx: Ctx, t: number, kid: Kid) {
  const u = t - T.book;
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, "#3b1f17");
  wall.addColorStop(1, "#1f0f0b");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);
  const lamp = ctx.createRadialGradient(240, 120, 10, 240, 120, 620);
  lamp.addColorStop(0, "rgba(255,200,110,.38)");
  lamp.addColorStop(1, "rgba(255,200,110,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);
  const desk = ctx.createLinearGradient(0, 560, 0, H);
  desk.addColorStop(0, "#6a3d22");
  desk.addColorStop(1, "#3e2314");
  ctx.fillStyle = desk;
  ctx.fillRect(0, 560, W, H - 560);

  // book
  const open = easeInOut(prog(u, 0.2, 1.4));
  const bx = 250, by = 150, pw = 390, ph = 450;
  ctx.fillStyle = "#5e1418";
  roundRect(ctx, bx - 18, by - 14, pw * 2 + 36, ph + 34, 14);
  ctx.fill();
  const page = (x: number, w: number) => {
    ctx.fillStyle = C.paper;
    ctx.fillRect(x, by, w, ph);
  };
  page(bx, pw);
  if (open > 0.02) page(bx + pw, pw * open);
  const spine = ctx.createLinearGradient(bx + pw - 30, 0, bx + pw + 30, 0);
  spine.addColorStop(0, "rgba(0,0,0,0)");
  spine.addColorStop(0.5, "rgba(0,0,0,.22)");
  spine.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = spine;
  ctx.fillRect(bx + pw - 30, by, 60, ph);

  // left page
  ctx.textAlign = "center";
  ctx.fillStyle = C.berry;
  ctx.font = F.serif(40);
  ctx.fillText("The Nice List", bx + pw / 2, by + 62);
  ctx.fillStyle = C.ink;
  ctx.font = F.hand(26);
  ctx.fillText(`Christmas ${christmasYear()}`, bx + pw / 2, by + 96);
  ctx.textAlign = "left";
  for (let i = 0; i < 9; i++) {
    const ly = by + 150 + i * 34;
    ctx.strokeStyle = "rgba(120,150,190,.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + 30, ly + 8);
    ctx.lineTo(bx + pw - 30, ly + 8);
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.font = F.hand(28);
    ctx.fillText(NICE_LIST_NAMES[(i * 5 + 2) % NICE_LIST_NAMES.length], bx + 44, ly);
    check(ctx, bx + pw - 90, ly - 8, 0.55, 1, C.pine2);
    check(ctx, bx + pw - 66, ly - 8, 0.55, 1, C.pine2);
  }

  // right page
  if (open > 0.95) {
    const rx = bx + pw;
    ctx.textAlign = "center";
    ctx.fillStyle = C.ink;
    ctx.font = F.mono(16);
    ctx.fillText("PAGE 1,224", rx + pw / 2, by + 50);
    ctx.textAlign = "left";
    for (let i = 0; i < 9; i++) {
      const ly = by + 110 + i * 38;
      ctx.strokeStyle = "rgba(120,150,190,.35)";
      ctx.beginPath();
      ctx.moveTo(rx + 30, ly + 8);
      ctx.lineTo(rx + pw - 30, ly + 8);
      ctx.stroke();
      if (i === 4) continue;
      ctx.fillStyle = C.ink;
      ctx.font = F.hand(28);
      ctx.fillText(NICE_LIST_NAMES[(i * 7 + 4) % NICE_LIST_NAMES.length], rx + 44, ly);
      check(ctx, rx + pw - 90, ly - 8, 0.55, 1, C.pine2);
      check(ctx, rx + pw - 66, ly - 8, 0.55, 1, C.pine2);
    }
    // the child's line
    const ly = by + 110 + 4 * 38 + 6;
    const write = prog(u, 2.0, 3.8);
    ctx.font = F.hand(46, 700);
    const nameW = Math.min(ctx.measureText(kid.name).width, pw - 150);
    ctx.fillStyle = `rgba(255,238,140,${0.9 * prog(u, 1.8, 2.2)})`;
    ctx.fillRect(rx + 34, ly - 40, nameW + 24, 50);
    ctx.save();
    ctx.beginPath();
    ctx.rect(rx + 30, ly - 60, 20 + nameW * write, 90);
    ctx.clip();
    fitFont(ctx, kid.name, (s) => F.hand(s, 700), 46, pw - 150);
    ctx.fillStyle = C.berry;
    ctx.fillText(kid.name, rx + 44, ly);
    ctx.restore();
    if (write > 0 && write < 1) quill(ctx, rx + 46 + nameW * write, ly + 4 + Math.sin(u * 30) * 3, u);
    check(ctx, rx + pw - 96, ly - 12, 0.9, prog(u, 4.3, 4.7), C.berry);
    check(ctx, rx + pw - 62, ly - 12, 0.9, prog(u, 5.0, 5.4), C.berry);
    star(ctx, rx + 18, ly - 16, 16 * back(prog(u, 5.4, 5.9)), C.goldDeep);
    sparkles(ctx, rx + pw - 60, ly - 16, prog(u, 5.4, 6.6), 12, 140);
  }

  caption(ctx, u < 4.2 ? "Santa opened the Nice List..." : "...and checked it twice!", 80, u < 4.2 ? prog(u, 0.4, 1.0) : prog(u, 4.2, 4.7));
}

function sceneReport(ctx: Ctx, t: number, kid: Kid) {
  const u = t - T.report;
  ctx.fillStyle = C.pine;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(232,199,102,.08)";
  for (let y = 0; y < H; y += 48) for (let x = (y / 48) % 2 ? 24 : 0; x < W; x += 48) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  caption(ctx, `My elves sent me a report about you, ${kid.name}.`, 72, prog(u, 0.3, 0.9), { size: 40 });

  const slide = easeOut(prog(u, 0.2, 1.0));
  const shake = u > 5.6 && u < 5.85 ? Math.sin(u * 160) * 6 : 0;
  ctx.save();
  ctx.translate(W / 2 + shake, 400 + (1 - slide) * 500);
  ctx.rotate(-0.025);
  const cw = 820, ch = 500;
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.fillRect(-cw / 2 + 10, -ch / 2 + 14, cw, ch);
  ctx.fillStyle = C.paper;
  ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
  ctx.fillStyle = C.berry;
  ctx.fillRect(-cw / 2, -ch / 2, cw, 64);
  ctx.fillStyle = "#fff";
  ctx.font = F.mono(26);
  ctx.textAlign = "left";
  ctx.fillText("SCOUT ELF REPORT", -cw / 2 + 30, -ch / 2 + 42);
  ctx.font = F.mono(15, 400);
  ctx.textAlign = "right";
  ctx.fillText(`FILE NP-${christmasYear()}-${(kid.name.length * 7919 + 1224) % 99999}`, cw / 2 - 26, -ch / 2 + 40);

  ctx.textAlign = "left";
  const rows: [string, string][] = [["NAME", kid.name]];
  if (kid.age) rows.push(["AGE", kid.age]);
  if (kid.city) rows.push(["HOMETOWN", kid.city]);
  rows.forEach(([k, v], i) => {
    const y = -ch / 2 + 112 + i * 44;
    ctx.fillStyle = C.ink;
    ctx.font = F.mono(18);
    ctx.fillText(`${k}:`, -cw / 2 + 34, y);
    ctx.font = F.hand(34, 700);
    ctx.fillText(v, -cw / 2 + 190, y + 2);
  });
  const oy = -ch / 2 + 112 + rows.length * 44 + 14;
  ctx.font = F.mono(18);
  ctx.fillStyle = C.ink;
  ctx.fillText("OBSERVED:", -cw / 2 + 34, oy);

  const deedText = `You ${kid.deed}!`;
  ctx.font = F.hand(40);
  const lines = wrapLines(ctx, deedText, cw - 80);
  const chars = Math.floor(deedText.length * prog(u, 1.4, 4.6));
  let used = 0;
  lines.slice(0, 3).forEach((ln, i) => {
    const show = ln.slice(0, Math.max(0, chars - used));
    used += ln.length + 1;
    ctx.fillStyle = C.ink;
    ctx.fillText(show, -cw / 2 + 40, oy + 50 + i * 46);
  });
  ctx.restore();

  stamp(ctx, ["VERY", "NICE!"], W / 2 + 250, 310, prog(u, 5.4, 5.75), C.berry, -0.2);
  sparkles(ctx, W / 2 + 250, 310, prog(u, 5.7, 6.9), 14, 190);
}

function sceneWish(ctx: Ctx, t: number, kid: Kid) {
  const u = t - T.wish;
  const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 800);
  g.addColorStop(0, "#b3313a");
  g.addColorStop(1, "#4d0c10");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 2 + i);
    star(ctx, rand(i, 1) * W, rand(i, 2) * H, 3 + rand(i, 3) * 4, C.gold, t * 0.3 + i);
  }
  ctx.globalAlpha = 1;
  caption(ctx, "Your wish made it to the workshop!", 74, prog(u, 0.3, 0.9), { size: 44 });

  // tag
  const tagP = easeOut(prog(u, 0.2, 1.0));
  ctx.save();
  ctx.translate(470, 400);
  ctx.rotate(-0.06 + (1 - tagP) * -0.4);
  ctx.globalAlpha = tagP;
  const tw = 600, th = 330;
  ctx.fillStyle = C.paper;
  ctx.beginPath();
  ctx.moveTo(-tw / 2 + 70, -th / 2);
  ctx.lineTo(tw / 2, -th / 2);
  ctx.lineTo(tw / 2, th / 2);
  ctx.lineTo(-tw / 2 + 70, th / 2);
  ctx.lineTo(-tw / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4d0c10";
  ctx.beginPath();
  ctx.arc(-tw / 2 + 50, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.green;
  ctx.font = F.mono(22);
  ctx.textAlign = "left";
  ctx.fillText("WISH RECEIVED", -tw / 2 + 110, -th / 2 + 56);
  ctx.fillStyle = C.ink;
  ctx.font = F.hand(48, 700);
  const lines = wrapLines(ctx, kid.wish, tw - 160).slice(0, 3);
  lines.forEach((l, i) => ctx.fillText(l, -tw / 2 + 110, -th / 2 + 120 + i * 52));
  ctx.font = F.hand(32);
  ctx.fillStyle = C.berry;
  ctx.fillText(`for ${kid.name}`, -tw / 2 + 110, th / 2 - 36);
  ctx.restore();

  stamp(ctx, ["APPROVED", "BY SANTA"], 560, 480, prog(u, 2.8, 3.15), C.green, 0.14);

  // gift drop
  const drop = bounce(prog(u, 0.8, 2.0));
  const lid = easeOut(prog(u, 4.2, 4.8)) - easeOut(prog(u, 6.0, 6.5));
  gift(ctx, 1000, -160 + drop * 760, 1.1, lid);
  sparkles(ctx, 1000, 420, prog(u, 4.3, 5.8), 16, 220);
  sparkles(ctx, 560, 480, prog(u, 3.1, 4.2), 12, 170, "#9be3b8");
}

function bez(p: number, a: number, b: number, c: number, d: number) {
  const q = 1 - p;
  return q * q * q * a + 3 * q * q * p * b + 3 * q * p * p * c + p * p * p * d;
}

function sceneSleigh(ctx: Ctx, t: number, kid: Kid) {
  const u = t - T.sleigh;
  nightSky(ctx, t);
  aurora(ctx, t, 0.5);
  // moon
  ctx.fillStyle = "#f6f0d8";
  ctx.beginPath();
  ctx.arc(1110, 130, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,.06)";
  [[1090, 115, 12], [1130, 150, 9], [1120, 108, 6]].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  hills(ctx, t, "#eef4f7");
  // town lights
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(255,214,120,${0.5 + 0.4 * Math.sin(t * 2 + i)})`;
    ctx.fillRect(820 + rand(i, 1) * 380, 600 + rand(i, 2) * 30, 4, 4);
  }

  const P = { x: [150, 460, 820, 1040], y: [250, 70, 260, 520] };
  const at = (p: number) => ({ x: bez(p, P.x[0], P.x[1], P.x[2], P.x[3]), y: bez(p, P.y[0], P.y[1], P.y[2], P.y[3]) });
  const reveal = prog(u, 0.6, 6.6);
  ctx.fillStyle = C.gold;
  for (let i = 0; i <= 60; i++) {
    const p = i / 60;
    if (p > reveal) break;
    const pt = at(p);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // start
  star(ctx, P.x[0], P.y[0], 18, C.gold, t * 0.5);
  ctx.fillStyle = C.gold;
  ctx.font = F.mono(18);
  ctx.textAlign = "center";
  ctx.fillText("NORTH POLE", P.x[0], P.y[0] + 44);
  // destination
  house(ctx, P.x[3] + 30, P.y[3] + 60, 0.9, t);
  const city = kid.city || "your house";
  ctx.fillStyle = C.ink;
  fitFont(ctx, city, (s) => F.hand(s, 700), 40, 330);
  ctx.fillText(city, P.x[3] + 20, P.y[3] + 126);
  ctx.font = F.hand(28);
  ctx.fillText(`${kid.name}'s house`, P.x[3] + 20, P.y[3] + 158);

  const sp = easeInOut(prog(u, 1.0, 7.4));
  const pos = at(Math.min(reveal + 0.02, sp));
  const nxt = at(Math.min(1, sp + 0.01));
  const ang = Math.atan2(nxt.y - pos.y, nxt.x - pos.x) * 0.6;
  if (u > 0.9) sleigh(ctx, pos.x, pos.y - 30 + Math.sin(u * 4) * 6, 0.62, t, ang);
  sparkles(ctx, P.x[3] + 30, P.y[3], prog(u, 7.3, 8.6), 16, 200);

  caption(ctx, "Santa's Christmas Eve flight plan", 64, prog(u, 0.3, 0.9), { size: 40 });
}

function sceneSanta(ctx: Ctx, t: number, kid: Kid) {
  const u = t - T.santa;
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, C.pine2);
  wall.addColorStop(1, "#0f2a21");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);
  // window
  ctx.save();
  ctx.beginPath();
  ctx.rect(70, 90, 300, 360);
  ctx.clip();
  nightSky(ctx, t);
  snow(ctx, t * 1.3, 40, 0.9);
  ctx.restore();
  ctx.strokeStyle = "#5b3520";
  ctx.lineWidth = 16;
  ctx.strokeRect(70, 90, 300, 360);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(220, 90);
  ctx.lineTo(220, 450);
  ctx.moveTo(70, 270);
  ctx.lineTo(370, 270);
  ctx.stroke();
  // garland
  for (let x = 0; x < W; x += 18) {
    const y = 26 + Math.sin(x * 0.012) * 14;
    ctx.fillStyle = C.pine;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 18; i++) {
    const x = 30 + i * 72;
    const on = Math.sin(t * 4 + i) > 0;
    ctx.fillStyle = [C.berry, C.gold, "#5ec8ff", "#9be3b8"][i % 4];
    ctx.globalAlpha = on ? 1 : 0.45;
    ctx.beginPath();
    ctx.arc(x, 34 + Math.sin(x * 0.012) * 14, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // floor
  ctx.fillStyle = "#3e2314";
  ctx.fillRect(0, 640, W, 80);

  const enter = easeOut(prog(u, 0, 1.0));
  const ho = u > 3.2 && u < 5.2 ? Math.abs(Math.sin((u - 3.2) * Math.PI * 1.5)) : 0;
  santa(ctx, 990, 300 + (1 - enter) * 420 - ho * 8, 0.92, t, ho);

  ctx.textAlign = "left";
  const lx = 400;
  const a1 = prog(u, 0.6, 1.2), a2 = prog(u, 1.2, 1.8), a3 = prog(u, 1.8, 2.6);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.5)";
  ctx.shadowBlur = 14;
  ctx.globalAlpha = a1;
  ctx.fillStyle = C.snow;
  ctx.font = F.serif(48);
  ctx.fillText("See you on", lx, 190);
  ctx.globalAlpha = a2;
  ctx.fillText("Christmas Eve,", lx, 250);
  ctx.globalAlpha = a3;
  ctx.fillStyle = C.gold;
  fitFont(ctx, `${kid.name}!`, F.script, 64, 380);
  ctx.fillText(`${kid.name}!`, lx, 350);
  ctx.globalAlpha = prog(u, 3.2, 3.6);
  ctx.fillStyle = "#ffd9d6";
  ctx.font = F.serif(56);
  ctx.fillText("Ho ho ho!", lx, 450);
  ctx.restore();
  // signature
  const sig = prog(u, 5.0, 6.4);
  if (sig > 0) {
    ctx.save();
    ctx.font = F.script(40);
    const sw = ctx.measureText("Love, Santa").width;
    ctx.beginPath();
    ctx.rect(lx, 480, sw * sig + 10, 90);
    ctx.clip();
    ctx.fillStyle = C.snow;
    ctx.fillText("Love, Santa", lx, 540);
    ctx.restore();
  }
  if (kid.pet) {
    ctx.globalAlpha = prog(u, 6.4, 7.0);
    ctx.fillStyle = "#cfe6ee";
    fitFont(ctx, `P.S. Give ${kid.pet} a hug from me!`, (s) => F.hand(s), 30, 360);
    ctx.fillText(`P.S. Give ${kid.pet} a hug from me!`, lx, 610);
    ctx.globalAlpha = 1;
  }
}

// ---------- main ----------

export type DrawOpts = { watermark?: boolean; brand?: string };

export function draw(ctx: Ctx, t: number, kid: Kid, opts: DrawOpts = {}) {
  const k: Kid = { ...kid, name: kid.name || "Little One", deed: kid.deed || "were kind to the people around you", wish: kid.wish || "something very special" };
  ctx.save();
  ctx.textBaseline = "alphabetic";
  if (t < T.book) sceneIntro(ctx, t, k);
  else if (t < T.report) sceneBook(ctx, t, k);
  else if (t < T.wish) sceneReport(ctx, t, k);
  else if (t < T.sleigh) sceneWish(ctx, t, k);
  else if (t < T.santa) sceneSleigh(ctx, t, k);
  else sceneSanta(ctx, t, k);
  ctx.restore();

  if (t < T.book || (t >= T.sleigh && t < T.santa)) snow(ctx, t, 90, 0.8);
  else if (t >= T.santa) snow(ctx, t, 26, 0.35);

  // dip transitions
  let dip = 0;
  for (const b of Object.values(T)) dip = Math.max(dip, 1 - Math.abs(t - b) / 0.45);
  dip = Math.max(dip, 1 - t / 0.6, 1 - (DURATION - t) / 1.2);
  if (dip > 0) {
    ctx.fillStyle = `rgba(5,12,20,${clamp(dip)})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (opts.watermark) {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.4);
    ctx.font = F.serif(170);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,.13)";
    ctx.fillText("PREVIEW", 0, 0);
    ctx.restore();
  }
  if (opts.brand) {
    ctx.save();
    ctx.font = F.mono(16);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillText(opts.brand, W - 24, H - 22);
    ctx.restore();
  }
}
