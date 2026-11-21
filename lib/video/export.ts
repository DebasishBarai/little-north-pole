// Turns the animated video into a downloadable file, fully in the browser.
// Fast path: WebCodecs + mp4-muxer (renders faster than real time).
// Fallback: MediaRecorder capturing a real-time playback.
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import type { Kid } from "../letter";
import { draw, DURATION, FPS, H, W, FONT_LOADS } from "./scene";
import { scheduleSoundtrack } from "./audio";

export async function loadVideoFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(FONT_LOADS.map((f) => document.fonts.load(f).catch(() => null)));
}

type Progress = (p: number, label?: string) => void;
const SR = 48000;

async function pickVideoConfig(): Promise<VideoEncoderConfig | null> {
  if (typeof VideoEncoder === "undefined") return null;
  for (const codec of ["avc1.4d0028", "avc1.42001f", "avc1.640028"]) {
    const cfg: VideoEncoderConfig = { codec, width: W, height: H, bitrate: 5_000_000, framerate: FPS };
    try {
      const r = await VideoEncoder.isConfigSupported(cfg);
      if (r.supported) return cfg;
    } catch {}
  }
  return null;
}

async function pickAudioConfig(): Promise<AudioEncoderConfig | null> {
  if (typeof AudioEncoder === "undefined") return null;
  const cfg: AudioEncoderConfig = { codec: "mp4a.40.2", sampleRate: SR, numberOfChannels: 2, bitrate: 128_000 };
  try {
    const r = await AudioEncoder.isConfigSupported(cfg);
    return r.supported ? cfg : null;
  } catch {
    return null;
  }
}

async function exportWebCodecs(kid: Kid, onProgress: Progress, vcfg: VideoEncoderConfig, acfg: AudioEncoderConfig) {
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: "avc", width: W, height: H, frameRate: FPS },
    audio: { codec: "aac", numberOfChannels: 2, sampleRate: SR },
    fastStart: "in-memory",
    firstTimestampBehavior: "offset",
  });

  // audio first (rendered offline, faster than real time)
  onProgress(0.02, "Recording the sleigh bells...");
  const frames = Math.ceil(DURATION * SR);
  const off = new OfflineAudioContext(2, frames, SR);
  scheduleSoundtrack(off, off.destination, 0, 0);
  const buf = await off.startRendering();
  let audioErr: unknown = null;
  const aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: (e) => (audioErr = e) });
  aenc.configure(acfg);
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  for (let i = 0; i < frames; i += 1024) {
    const n = Math.min(1024, frames - i);
    const data = new Float32Array(n * 2);
    data.set(L.subarray(i, i + n), 0);
    data.set(R.subarray(i, i + n), n);
    const ad = new AudioData({ format: "f32-planar", sampleRate: SR, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((i / SR) * 1e6), data });
    aenc.encode(ad);
    ad.close();
  }
  await aenc.flush();
  if (audioErr) throw audioErr;

  // video frames
  const canvas: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  let videoErr: unknown = null;
  const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => (videoErr = e) });
  venc.configure(vcfg);
  const total = Math.round(DURATION * FPS);
  for (let i = 0; i < total; i++) {
    if (videoErr) throw videoErr;
    draw(ctx, i / FPS, kid);
    const frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
    venc.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
    frame.close();
    while (venc.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 1));
    if (i % 15 === 0) {
      onProgress(0.05 + 0.93 * (i / total), "Animating the North Pole...");
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  await venc.flush();
  if (videoErr) throw videoErr;
  muxer.finalize();
  onProgress(1, "Done");
  return { blob: new Blob([target.buffer], { type: "video/mp4" }), ext: "mp4" };
}

async function exportRealtime(kid: Kid, onProgress: Progress) {
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d")!;
  const ac = new AudioContext({ sampleRate: SR });
  const dest = ac.createMediaStreamDestination();
  const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const types = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
  const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((r) => (rec.onstop = () => r()));
  draw(ctx, 0, kid);
  await ac.resume();
  const start = ac.currentTime + 0.15;
  scheduleSoundtrack(ac, dest, start, 0);
  rec.start(500);
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = ac.currentTime - start;
      draw(ctx, Math.max(0, Math.min(DURATION, t)), kid);
      onProgress(Math.min(0.99, t / DURATION), "Recording in real time (keep this tab open)...");
      if (t >= DURATION + 0.2) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  await done;
  await ac.close();
  const type = rec.mimeType || mimeType || "video/webm";
  onProgress(1, "Done");
  return { blob: new Blob(chunks, { type }), ext: type.includes("mp4") ? "mp4" : "webm" };
}

export async function exportVideo(kid: Kid, onProgress: Progress = () => {}) {
  await loadVideoFonts();
  const [vcfg, acfg] = await Promise.all([pickVideoConfig(), pickAudioConfig()]);
  if (vcfg && acfg) {
    try {
      return await exportWebCodecs(kid, onProgress, vcfg, acfg);
    } catch (e) {
      console.warn("WebCodecs export failed, falling back to real-time recording", e);
    }
  }
  return exportRealtime(kid, onProgress);
}
