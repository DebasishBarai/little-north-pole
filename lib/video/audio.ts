// Synthesized soundtrack: Jingle Bells (public domain, 1857) with bells, bass,
// sleigh bells and a few sound effects. Works on AudioContext and OfflineAudioContext.
import { DURATION, T } from "./scene";

const BPM = 150;
const BEAT = 60 / BPM;
const N: Record<string, number> = {
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B4: 493.88, A4: 440, G4: 392,
  C3: 130.81, F2: 87.31, G2: 98.0, D3: 146.83, E3: 164.81, A2: 110,
};

// [note, beats]
const LINE_A: [string, number][] = [["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["G5", 1], ["C5", 1.5], ["D5", 0.5], ["E5", 4]];
const LINE_B: [string, number][] = [["F5", 1], ["F5", 1], ["F5", 1.5], ["F5", 0.5], ["F5", 1], ["E5", 1], ["E5", 1], ["E5", 0.5], ["E5", 0.5], ["E5", 1], ["D5", 1], ["D5", 1], ["E5", 1], ["D5", 2], ["G5", 2]];
const LINE_D: [string, number][] = [["F5", 1], ["F5", 1], ["F5", 1.5], ["F5", 0.5], ["F5", 1], ["E5", 1], ["E5", 1], ["E5", 0.5], ["E5", 0.5], ["G5", 1], ["G5", 1], ["F5", 1], ["D5", 1], ["C5", 4]];
const MELODY = [...LINE_A, ...LINE_B, ...LINE_A, ...LINE_D];
// one chord root per bar (16 bars per pass)
const BASS = ["C3", "C3", "C3", "C3", "F2", "C3", "G2", "G2", "C3", "C3", "C3", "C3", "F2", "C3", "G2", "C3"];

type Ev = { at: number; play: (ctx: BaseAudioContext, out: AudioNode, when: number) => void };

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();
function noise(ctx: BaseAudioContext) {
  let b = noiseCache.get(ctx);
  if (!b) {
    b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = b.getChannelData(0);
    let s = 12345;
    for (let i = 0; i < d.length; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      d[i] = (s / 0x7fffffff) * 2 - 1;
    }
    noiseCache.set(ctx, b);
  }
  return b;
}

function env(ctx: BaseAudioContext, out: AudioNode, when: number, peak: number, decay: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(peak, when + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
  g.connect(out);
  return g;
}

function bell(ctx: BaseAudioContext, out: AudioNode, when: number, f: number, dur: number, vol = 0.22) {
  const g = env(ctx, out, when, vol, dur * 1.8 + 0.25);
  [[1, 1], [2.76, 0.32], [5.4, 0.12], [2, 0.2]].forEach(([m, a]) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f * m;
    const og = ctx.createGain();
    og.gain.value = a;
    o.connect(og).connect(g);
    o.start(when);
    o.stop(when + dur * 1.8 + 0.3);
  });
}

function bass(ctx: BaseAudioContext, out: AudioNode, when: number, f: number, dur: number) {
  const g = env(ctx, out, when, 0.2, dur);
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.value = f;
  o.connect(g);
  o.start(when);
  o.stop(when + dur + 0.05);
}

function shaker(ctx: BaseAudioContext, out: AudioNode, when: number, vol = 0.05) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 7800;
  bp.Q.value = 1.2;
  const g = env(ctx, out, when, vol, 0.11);
  src.connect(bp).connect(g);
  src.start(when, Math.random() * 0.5, 0.15);
}

function thud(ctx: BaseAudioContext, out: AudioNode, when: number) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(130, when);
  o.frequency.exponentialRampToValueAtTime(40, when + 0.25);
  const g = env(ctx, out, when, 0.7, 0.35);
  o.connect(g);
  o.start(when);
  o.stop(when + 0.4);
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  src.connect(lp).connect(env(ctx, out, when, 0.35, 0.18));
  src.start(when, 0, 0.2);
}

function whoosh(ctx: BaseAudioContext, out: AudioNode, when: number, len = 1.6) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(400, when);
  bp.frequency.exponentialRampToValueAtTime(3000, when + len);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.18, when + len * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, when + len);
  src.connect(bp).connect(g).connect(out);
  src.start(when);
  src.stop(when + len + 0.05);
}

function sparkle(ctx: BaseAudioContext, out: AudioNode, when: number) {
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => bell(ctx, out, when + i * 0.07, f, 0.25, 0.1));
}

function events(): Ev[] {
  const ev: Ev[] = [];
  for (let pass = 0; pass < 2; pass++) {
    const off = pass * 64 * BEAT;
    let b = 0;
    for (const [n, len] of MELODY) {
      const at = off + b * BEAT;
      const f = N[n];
      ev.push({ at, play: (c, o, w) => bell(c, o, w, f, len * BEAT, 0.2) });
      if (pass === 1) ev.push({ at, play: (c, o, w) => bell(c, o, w, f * 2, len * BEAT * 0.6, 0.05) });
      b += len;
    }
    BASS.forEach((n, bar) => {
      for (const beat of [0, 2]) {
        const at = off + (bar * 4 + beat) * BEAT;
        const f = beat === 0 ? N[n] : N[n] * 1.5;
        ev.push({ at, play: (c, o, w) => bass(c, o, w, f, BEAT * 1.8) });
      }
    });
    for (let e = 0; e < 128; e++) {
      const at = off + e * BEAT * 0.5;
      ev.push({ at, play: (c, o, w) => shaker(c, o, w, e % 2 ? 0.03 : 0.055) });
    }
  }
  // effects synced to the scenes
  ev.push({ at: T.book + 5.4, play: sparkle });
  ev.push({ at: T.report + 5.5, play: thud });
  ev.push({ at: T.report + 5.7, play: sparkle });
  ev.push({ at: T.wish + 2.9, play: thud });
  ev.push({ at: T.wish + 4.3, play: sparkle });
  ev.push({ at: T.sleigh + 0.9, play: (c, o, w) => whoosh(c, o, w, 1.8) });
  ev.push({ at: T.sleigh + 7.3, play: sparkle });
  ev.push({ at: 3.0, play: sparkle });
  return ev.sort((a, b) => a.at - b.at);
}

const EVENTS = events();

function masterChain(ctx: BaseAudioContext, dest: AudioNode, startWhen: number, offset: number) {
  const master = ctx.createGain();
  master.gain.value = 0.75;
  // fade out at the end
  const endAt = startWhen + (DURATION - offset);
  master.gain.setValueAtTime(0.75, Math.max(startWhen, endAt - 1.6));
  master.gain.linearRampToValueAtTime(0.0001, endAt);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 3;
  // simple echo for a bit of space
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.27;
  const fb = ctx.createGain();
  fb.gain.value = 0.22;
  const wet = ctx.createGain();
  wet.gain.value = 0.18;
  master.connect(comp).connect(dest);
  master.connect(delay);
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(comp);
  return master;
}

/** Schedule everything from `offset` seconds into the video, starting at ctx time `startWhen`. */
export function scheduleSoundtrack(ctx: BaseAudioContext, dest: AudioNode, startWhen: number, offset = 0) {
  const out = masterChain(ctx, dest, startWhen, offset);
  for (const e of EVENTS) {
    if (e.at < offset - 0.01 || e.at > DURATION) continue;
    e.play(ctx, out, startWhen + e.at - offset);
  }
  return out;
}
