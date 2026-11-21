import { PDFDocument, PDFFont, PDFPage, rgb, degrees, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import * as F from "./fonts.generated";
import { Kid, buildLetter, NICE_LIST_NAMES, christmasYear } from "./letter";

const C = {
  paper: rgb(0.992, 0.976, 0.941),
  ink: rgb(0.118, 0.169, 0.29),
  red: rgb(0.659, 0.137, 0.169),
  redDark: rgb(0.48, 0.08, 0.11),
  green: rgb(0.114, 0.271, 0.208),
  gold: rgb(0.722, 0.565, 0.184),
  goldLight: rgb(0.93, 0.85, 0.6),
  rule: rgb(0.78, 0.84, 0.9),
  margin: rgb(0.9, 0.55, 0.55),
  highlight: rgb(1, 0.93, 0.55),
  white: rgb(1, 1, 1),
  faint: rgb(0.55, 0.55, 0.55),
};

type Fonts = {
  hand: PDFFont;
  handBold: PDFFont;
  serif: PDFFont;
  mono: PDFFont;
  monoBold: PDFFont;
  script: PDFFont;
};

const b64 = (s: string) => Uint8Array.from(Buffer.from(s, "base64"));

// ---------- helpers ----------

function wrap(font: PDFFont, size: number, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function centered(page: PDFPage, text: string, font: PDFFont, size: number, y: number, color: RGB, cx?: number) {
  const w = font.widthOfTextAtSize(text, size);
  const mid = cx ?? page.getWidth() / 2;
  page.drawText(text, { x: mid - w / 2, y, size, font, color });
}

function spaced(text: string) {
  return text.split("").join(" ");
}

// SVG star path centred on (0,0); pdf-lib draws SVG paths with y pointing down.
function starPath(outer: number, inner: number, points = 5): string {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)} `;
  }
  return d + "Z";
}

function star(page: PDFPage, x: number, y: number, outer: number, color: RGB, inner = outer * 0.45) {
  page.drawSvgPath(starPath(outer, inner), { x, y, color, borderWidth: 0 });
}

function holly(page: PDFPage, x: number, y: number, s = 1, flip = 1) {
  page.drawEllipse({ x: x - 9 * s * flip, y: y + 3 * s, xScale: 12 * s, yScale: 5 * s, color: C.green, rotate: degrees(25 * flip) });
  page.drawEllipse({ x: x + 9 * s * flip, y: y + 3 * s, xScale: 12 * s, yScale: 5 * s, color: C.green, rotate: degrees(-25 * flip) });
  page.drawCircle({ x: x - 3 * s, y: y - 2 * s, size: 3.6 * s, color: C.red });
  page.drawCircle({ x: x + 3.5 * s, y: y - 1 * s, size: 3.6 * s, color: C.red });
  page.drawCircle({ x: x, y: y + 3 * s, size: 3.6 * s, color: C.red });
}

function check(page: PDFPage, x: number, y: number, color: RGB, s = 1) {
  page.drawLine({ start: { x, y: y + 4 * s }, end: { x: x + 3.5 * s, y }, thickness: 1.8 * s, color });
  page.drawLine({ start: { x: x + 3.5 * s, y }, end: { x: x + 10 * s, y: y + 10 * s }, thickness: 1.8 * s, color });
}

function paper(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: C.paper });
}

function waxSeal(page: PDFPage, x: number, y: number, fonts: Fonts, label = "SC") {
  const blobs = [0, 50, 95, 140, 200, 250, 300];
  blobs.forEach((a, i) => {
    const r = 33 + (i % 2) * 3;
    page.drawCircle({ x: x + Math.cos((a * Math.PI) / 180) * r * 0.9, y: y + Math.sin((a * Math.PI) / 180) * r * 0.9, size: 9 + (i % 3) * 2, color: C.red });
  });
  page.drawCircle({ x, y, size: 34, color: C.red });
  page.drawCircle({ x, y, size: 25, borderColor: C.redDark, borderWidth: 1.6 });
  const w = fonts.serif.widthOfTextAtSize(label, 22);
  page.drawText(label, { x: x - w / 2, y: y - 7, size: 22, font: fonts.serif, color: rgb(0.96, 0.82, 0.8) });
}

function postageStamp(page: PDFPage, x: number, y: number, fonts: Fonts, year: number) {
  const w = 64, h = 78;
  page.drawRectangle({ x, y, width: w, height: h, color: C.white });
  // perforations
  for (let i = 0; i <= w; i += 6.4) {
    page.drawCircle({ x: x + i, y, size: 2.2, color: C.paper });
    page.drawCircle({ x: x + i, y: y + h, size: 2.2, color: C.paper });
  }
  for (let j = 0; j <= h; j += 6.5) {
    page.drawCircle({ x, y: y + j, size: 2.2, color: C.paper });
    page.drawCircle({ x: x + w, y: y + j, size: 2.2, color: C.paper });
  }
  page.drawRectangle({ x: x + 6, y: y + 6, width: w - 12, height: h - 12, color: C.green });
  // tree
  page.drawSvgPath("M0,0 L-14,16 L-7,16 L-17,30 L-8,30 L-19,44 L19,44 L8,30 L17,30 L7,16 L14,16 Z", { x: x + w / 2, y: y + h - 14, color: rgb(0.45, 0.66, 0.42) });
  page.drawRectangle({ x: x + w / 2 - 3, y: y + h - 64, width: 6, height: 6, color: C.goldLight });
  star(page, x + w / 2, y + h - 13, 5, C.goldLight);
  page.drawText(`${year}`, { x: x + 9, y: y + 9, size: 7, font: fonts.monoBold, color: C.goldLight });
  page.drawText("NP", { x: x + w - 22, y: y + 9, size: 7, font: fonts.monoBold, color: C.goldLight });
}

function postmark(page: PDFPage, x: number, y: number, fonts: Fonts, year: number) {
  const col = rgb(0.25, 0.28, 0.36);
  page.drawCircle({ x, y, size: 34, borderColor: col, borderWidth: 1.4, opacity: 0, borderOpacity: 0.75 });
  page.drawCircle({ x, y, size: 27, borderColor: col, borderWidth: 0.7, opacity: 0, borderOpacity: 0.75 });
  centered(page, "NORTH POLE", fonts.monoBold, 6.5, y + 13, col, x);
  centered(page, "DEC 24", fonts.monoBold, 9, y - 3, col, x);
  centered(page, `${year}`, fonts.monoBold, 6.5, y - 17, col, x);
  for (let i = 0; i < 4; i++) {
    const yy = y + 12 - i * 8;
    let d = "M0,0";
    for (let k = 1; k <= 8; k++) d += ` Q${k * 10 - 5},${k % 2 ? -4 : 4} ${k * 10},0`;
    page.drawSvgPath(d, { x: x - 125, y: yy, borderColor: col, borderWidth: 1.1, borderOpacity: 0.6 });
  }
}

function watermark(page: PDFPage, fonts: Fonts) {
  const w = page.getWidth(), h = page.getHeight();
  for (let i = -1; i <= 1; i++) {
    page.drawText("SAMPLE", {
      x: w / 2 - 210 + i * 40,
      y: h / 2 - 60 + i * 230,
      size: 110,
      font: fonts.serif,
      color: C.red,
      opacity: 0.08,
      rotate: degrees(30),
    });
  }
}

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(36).toUpperCase().slice(0, 6);
}

// ---------- pages ----------

function letterPage(doc: PDFDocument, fonts: Fonts, kid: Kid, variant: number, year: number) {
  const page = doc.addPage([612, 792]);
  const W = 612, H = 792;
  paper(page);
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, borderColor: C.green, borderWidth: 1.6 });
  page.drawRectangle({ x: 29, y: 29, width: W - 58, height: H - 58, borderColor: C.red, borderWidth: 0.6 });
  holly(page, 46, H - 46, 1, 1);
  holly(page, W - 46, H - 46, 1, -1);
  holly(page, 46, 46, 0.8, 1);
  holly(page, W - 46, 46, 0.8, -1);

  centered(page, spaced("FROM THE DESK OF"), fonts.monoBold, 8.5, H - 74, C.green);
  centered(page, "Santa Claus", fonts.serif, 36, H - 112, C.red);
  centered(page, "North Pole Workshop  ·  Candy Cane Lane  ·  Arctic Circle", fonts.mono, 8.5, H - 130, C.ink);
  page.drawLine({ start: { x: 150, y: H - 143 }, end: { x: W / 2 - 14, y: H - 143 }, thickness: 0.7, color: C.gold });
  page.drawLine({ start: { x: W / 2 + 14, y: H - 143 }, end: { x: W - 150, y: H - 143 }, thickness: 0.7, color: C.gold });
  star(page, W / 2, H - 143, 6, C.gold);

  const content = buildLetter(kid, variant);
  const left = 78, maxW = W - 2 * left;
  // Fit body text: shrink until it fits the page.
  let size = 18.5;
  let layout: { lines: string[][]; lh: number; gap: number } = { lines: [], lh: 0, gap: 0 };
  for (; size >= 13; size -= 0.5) {
    const lh = size * 1.22, gap = size * 0.55;
    const lines = content.paragraphs.map((p) => wrap(fonts.hand, size, p, maxW));
    const total = lines.reduce((a, l) => a + l.length * lh + gap, 0) + 210;
    layout = { lines, lh, gap };
    if (total < H - 200) break;
  }

  let y = H - 186;
  page.drawText(content.greeting, { x: left, y, size: size + 5, font: fonts.handBold, color: C.ink });
  y -= size * 1.9;
  for (const para of layout.lines) {
    for (const line of para) {
      page.drawText(line, { x: left, y, size, font: fonts.hand, color: C.ink });
      y -= layout.lh;
    }
    y -= layout.gap;
  }
  y -= 4;
  page.drawText(content.closing, { x: left, y, size, font: fonts.hand, color: C.ink });
  y -= 44;
  page.drawText("Santa Claus", { x: left + 4, y, size: 30, font: fonts.script, color: C.red });
  y -= 46;
  for (const line of wrap(fonts.hand, size - 1, content.ps, maxW - 110)) {
    page.drawText(line, { x: left, y, size: size - 1, font: fonts.hand, color: C.green });
    y -= layout.lh;
  }
  waxSeal(page, W - 104, 104, fonts);
  return page;
}

function certificatePage(doc: PDFDocument, fonts: Fonts, kid: Kid, year: number) {
  const W = 792, H = 612;
  const page = doc.addPage([W, H]);
  paper(page);
  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: H - 40, borderColor: C.gold, borderWidth: 6 });
  page.drawRectangle({ x: 32, y: 32, width: W - 64, height: H - 64, borderColor: C.green, borderWidth: 1.2 });
  page.drawRectangle({ x: 37, y: 37, width: W - 74, height: H - 74, borderColor: C.green, borderWidth: 0.5 });
  [[52, 52], [W - 52, 52], [52, H - 52], [W - 52, H - 52]].forEach(([x, y]) => star(page, x, y, 9, C.gold));
  for (let x = 90; x < W - 80; x += 34) {
    star(page, x, H - 52, 2.4, C.goldLight);
    star(page, x, 52, 2.4, C.goldLight);
  }

  centered(page, spaced("OFFICIAL CERTIFICATE"), fonts.monoBold, 10, H - 92, C.red);
  centered(page, "Santa's Nice List", fonts.serif, 46, H - 148, C.green);
  centered(page, "This is to certify that", fonts.hand, 22, H - 192, C.ink);

  const name = kid.name || "Little One";
  let nameSize = 54;
  while (fonts.script.widthOfTextAtSize(name, nameSize) > 520) nameSize -= 2;
  centered(page, name, fonts.script, nameSize, H - 262, C.red);
  page.drawLine({ start: { x: 196, y: H - 278 }, end: { x: W - 196, y: H - 278 }, thickness: 0.8, color: C.gold });

  const body = `has been found kind, thoughtful and full of Christmas spirit by the Elves of the North Pole, and is hereby placed on Santa's Nice List for Christmas ${year}.`;
  let y = H - 312;
  for (const line of wrap(fonts.hand, 21, body, 600)) {
    centered(page, line, fonts.hand, 21, y, C.ink);
    y -= 25;
  }
  const deed = kid.deed ? kid.deed[0].toUpperCase() + kid.deed.slice(1) : "";
  if (deed) {
    const noted = `Especially noted: ${deed.replace(/\byour\b/gi, "their").replace(/\byou\b/gi, "they")}.`;
    y -= 6;
    for (const line of wrap(fonts.hand, 18, noted, 540).slice(0, 2)) {
      centered(page, line, fonts.hand, 18, y, C.green);
      y -= 22;
    }
  }

  // signatures
  const sigY = 112;
  page.drawText("Santa Claus", { x: 112, y: sigY + 8, size: 24, font: fonts.script, color: C.red });
  page.drawLine({ start: { x: 100, y: sigY }, end: { x: 290, y: sigY }, thickness: 0.7, color: C.ink });
  centered(page, "SANTA CLAUS", fonts.monoBold, 8, sigY - 14, C.ink, 195);
  page.drawText("Pepper Minty", { x: W - 282, y: sigY + 8, size: 22, font: fonts.script, color: C.green });
  page.drawLine({ start: { x: W - 290, y: sigY }, end: { x: W - 100, y: sigY }, thickness: 0.7, color: C.ink });
  centered(page, "HEAD ELF, NICE LIST RECORDS", fonts.monoBold, 8, sigY - 14, C.ink, W - 195);

  // gold seal
  const sx = W / 2, sy = 126;
  page.drawSvgPath(starPath(52, 44, 24), { x: sx, y: sy, color: C.gold });
  page.drawCircle({ x: sx, y: sy, size: 38, borderColor: C.goldLight, borderWidth: 1.4, color: C.gold });
  centered(page, "NICE", fonts.serif, 15, sy + 4, C.white, sx);
  centered(page, "LIST", fonts.serif, 15, sy - 12, C.white, sx);
  centered(page, `${year}`, fonts.monoBold, 7, sy - 26, C.goldLight, sx);
  page.drawSvgPath("M-10,0 L-20,34 L-10,28 L0,36 Z M10,0 L20,34 L10,28 L0,36 Z", { x: sx, y: sy - 38, color: C.red });

  page.drawText(`CERTIFICATE NO. NP-${year}-${hash(name + kid.city)}`, { x: W - 250, y: 64, size: 7, font: fonts.mono, color: C.faint });
  return page;
}

function envelopePage(doc: PDFDocument, fonts: Fonts, kid: Kid, year: number) {
  const W = 792, H = 612;
  const page = doc.addPage([W, H]);
  const ew = 684, eh = 297; // #10 envelope
  const ex = (W - ew) / 2, ey = H - eh - 70;

  centered(page, spaced("NORTH POLE ENVELOPE"), fonts.monoBold, 9, H - 44, C.green);
  page.drawRectangle({ x: ex, y: ey, width: ew, height: eh, color: C.paper });
  // airmail stripes
  const stripe = 14, len = 22;
  const edge = (horizontal: boolean, fixed: number, from: number, to: number) => {
    let i = 0;
    for (let p = from; p + len <= to; p += len, i++) {
      const col = i % 2 ? C.ink : C.red;
      const d = horizontal ? `M0,0 L${len / 2},0 L${len},${-stripe} L${len / 2},${-stripe} Z` : `M0,0 L0,${len / 2} L${stripe},${len} L${stripe},${len / 2} Z`;
      if (horizontal) page.drawSvgPath(d, { x: p, y: fixed, color: col });
      else page.drawSvgPath(d, { x: fixed, y: p + len, color: col });
    }
  };
  edge(true, ey + eh - stripe, ex + stripe, ex + ew - stripe);
  edge(true, ey, ex + stripe, ex + ew - stripe);
  edge(false, ex, ey + stripe, ey + eh - stripe);
  edge(false, ex + ew - stripe, ey + stripe, ey + eh - stripe);

  // dashed cut line
  page.drawRectangle({ x: ex - 8, y: ey - 8, width: ew + 16, height: eh + 16, borderColor: C.faint, borderWidth: 0.6, borderDashArray: [4, 4] });

  // return address
  const rx = ex + 34;
  page.drawText("SANTA CLAUS", { x: rx, y: ey + eh - 50, size: 10, font: fonts.monoBold, color: C.ink });
  page.drawText("1 Candy Cane Lane", { x: rx, y: ey + eh - 64, size: 9, font: fonts.mono, color: C.ink });
  page.drawText("North Pole Workshop", { x: rx, y: ey + eh - 77, size: 9, font: fonts.mono, color: C.ink });
  page.drawText("Arctic Circle 00001", { x: rx, y: ey + eh - 90, size: 9, font: fonts.mono, color: C.ink });

  postageStamp(page, ex + ew - 100, ey + eh - 112, fonts, year);
  postmark(page, ex + ew - 130, ey + eh - 80, fonts, year);

  // special delivery stamp
  page.drawRectangle({ x: rx + 6, y: ey + 58, width: 150, height: 34, borderColor: C.red, borderWidth: 1.8, rotate: degrees(8), opacity: 0 });
  page.drawText("SPECIAL DELIVERY", { x: rx + 16, y: ey + 77, size: 10, font: fonts.monoBold, color: C.red, rotate: degrees(8) });
  page.drawText("BY REINDEER", { x: rx + 34, y: ey + 64, size: 10, font: fonts.monoBold, color: C.red, rotate: degrees(8) });

  // recipient
  const name = kid.name || "Little One";
  let ns = 34;
  while (fonts.script.widthOfTextAtSize(name, ns) > 300) ns -= 2;
  const ax = ex + 330;
  page.drawText(name, { x: ax, y: ey + 140, size: ns, font: fonts.script, color: C.ink });
  page.drawText(kid.city || "The Best House on the Block", { x: ax + 6, y: ey + 108, size: 22, font: fonts.hand, color: C.ink });
  page.drawText("Open on Christmas Eve!", { x: ax + 6, y: ey + 80, size: 16, font: fonts.hand, color: C.red });

  const tips = [
    "Cut along the dashed line and glue it to the front of a plain envelope,",
    "or fold the letter inside and tape the edges. Then hide it somewhere fun.",
  ];
  tips.forEach((t, i) => centered(page, t, fonts.mono, 9, ey - 44 - i * 14, C.faint));
  holly(page, W / 2, 70, 1.2);
  return page;
}

const TOWNS = ["Portland, OR", "Denver, CO", "Raleigh, NC", "Boise, ID", "Tulsa, OK", "Madison, WI", "Tampa, FL", "Omaha, NE", "Salem, MA", "Reno, NV", "Akron, OH", "Fresno, CA", "Mesa, AZ", "Provo, UT"];

function niceListPage(doc: PDFDocument, fonts: Fonts, kids: Kid[], year: number) {
  const W = 612, H = 792;
  const page = doc.addPage([W, H]);
  paper(page);
  page.drawRectangle({ x: 0, y: H - 150, width: W, height: 150, color: C.green });
  for (let x = 20; x < W; x += 46) star(page, x, H - 20 - ((x / 46) % 2) * 14, 2.5, C.goldLight);
  centered(page, spaced("NORTH POLE RECORDS DEPARTMENT"), fonts.monoBold, 8.5, H - 52, C.goldLight);
  centered(page, "The Nice List", fonts.serif, 44, H - 100, C.white);
  centered(page, `Christmas ${year}  ·  Volume XII  ·  Page 1,224`, fonts.mono, 9, H - 126, C.goldLight);

  const top = H - 196, rowH = 24, rows = 22;
  const colName = 112, colTown = 330, colStatus = 486;
  page.drawText("NAME", { x: colName, y: top + 12, size: 8, font: fonts.monoBold, color: C.red });
  page.drawText("HOMETOWN", { x: colTown, y: top + 12, size: 8, font: fonts.monoBold, color: C.red });
  page.drawText("STATUS", { x: colStatus, y: top + 12, size: 8, font: fonts.monoBold, color: C.red });
  page.drawLine({ start: { x: 96, y: 40 }, end: { x: 96, y: top + 26 }, thickness: 1, color: C.margin });

  const slots = [6, 13, 3, 18].slice(0, kids.length);
  let n = 0;
  for (let r = 0; r < rows; r++) {
    const y = top - r * rowH;
    page.drawLine({ start: { x: 40, y: y - 7 }, end: { x: W - 40, y: y - 7 }, thickness: 0.5, color: C.rule });
    const kidIdx = slots.indexOf(r);
    const num = 26871 + r;
    page.drawText(`${num}`, { x: 50, y: y, size: 8, font: fonts.mono, color: C.faint });
    if (kidIdx >= 0) {
      const k = kids[kidIdx];
      page.drawRectangle({ x: colName - 6, y: y - 5, width: 220, height: 20, color: C.highlight, opacity: 0.85 });
      page.drawText(k.name, { x: colName, y, size: 19, font: fonts.handBold, color: C.red });
      page.drawText(k.city || "Home Sweet Home", { x: colTown, y, size: 16, font: fonts.handBold, color: C.ink });
      check(page, colStatus, y - 1, C.red, 1.1);
      check(page, colStatus + 12, y - 1, C.red, 1.1);
      page.drawText("NICE!", { x: colStatus + 30, y, size: 9, font: fonts.monoBold, color: C.red });
      star(page, colName - 22, y + 5, 9, C.gold);
      page.drawText("checked twice!", { x: colTown + 92, y: y + 13, size: 12, font: fonts.hand, color: C.red, rotate: degrees(6) });
    } else {
      const nm = NICE_LIST_NAMES[(n * 7 + 3) % NICE_LIST_NAMES.length];
      page.drawText(nm, { x: colName, y, size: 16, font: fonts.hand, color: C.ink });
      page.drawText(TOWNS[n % TOWNS.length], { x: colTown, y, size: 14, font: fonts.hand, color: C.ink, opacity: 0.85 });
      check(page, colStatus, y, C.green, 0.9);
      check(page, colStatus + 11, y, C.green, 0.9);
      n++;
    }
  }
  page.drawText("Santa Claus", { x: W - 200, y: 52, size: 18, font: fonts.script, color: C.red });
  page.drawText("Verified by", { x: W - 268, y: 56, size: 12, font: fonts.hand, color: C.ink });
  return page;
}

// ---------- entry ----------

export async function renderPack(kids: Kid[], opts: { sample?: boolean } = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fonts: Fonts = {
    hand: await doc.embedFont(b64(F.caveat), { subset: true }),
    handBold: await doc.embedFont(b64(F.caveatBold), { subset: true }),
    serif: await doc.embedFont(b64(F.serif), { subset: true }),
    mono: await doc.embedFont(b64(F.mono), { subset: true }),
    monoBold: await doc.embedFont(b64(F.monoBold), { subset: true }),
    script: await doc.embedFont(b64(F.script), { subset: true }),
  };
  const year = christmasYear();
  doc.setTitle(`Letters from Santa for ${kids.map((k) => k.name).join(", ")}`);
  doc.setAuthor("Santa Claus, North Pole");
  doc.setCreator("Checked Twice");

  const pages: PDFPage[] = [];
  kids.forEach((kid, i) => {
    pages.push(letterPage(doc, fonts, kid, i, year));
    pages.push(certificatePage(doc, fonts, kid, year));
    pages.push(envelopePage(doc, fonts, kid, year));
  });
  pages.push(niceListPage(doc, fonts, kids, year));
  if (opts.sample) pages.forEach((p) => watermark(p, fonts));
  return doc.save();
}
