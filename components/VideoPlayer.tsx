"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Kid } from "@/lib/letter";
import { draw, DURATION, H, W } from "@/lib/video/scene";
import { scheduleSoundtrack } from "@/lib/video/audio";
import { exportVideo, loadVideoFonts } from "@/lib/video/export";

type Props = { kid: Kid; watermark?: boolean; allowDownload?: boolean; posterAt?: number; className?: string };

export default function VideoPlayer({ kid, watermark = false, allowDownload = false, posterAt = 4.2, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kidRef = useRef(kid);
  const acRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const [state, setState] = useState<"idle" | "playing" | "ended">("idle");
  const [time, setTime] = useState(0);
  const [exporting, setExporting] = useState<{ p: number; label: string } | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  kidRef.current = kid;

  const paint = useCallback(
    (t: number) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) draw(ctx, t, kidRef.current, { watermark });
    },
    [watermark]
  );

  useEffect(() => {
    loadVideoFonts().then(() => setFontsReady(true));
  }, []);

  // poster frame (and live updates while paused)
  useEffect(() => {
    if (state !== "playing") paint(state === "ended" ? DURATION - 1.3 : posterAt);
  }, [kid, paint, posterAt, state, fontsReady]);

  // debug hook for screenshots: window.dispatchEvent(new CustomEvent("np-seek", { detail: 12 }))
  useEffect(() => {
    const h = (e: Event) => paint(Number((e as CustomEvent).detail) || 0);
    window.addEventListener("np-seek", h);
    return () => window.removeEventListener("np-seek", h);
  }, [paint]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    acRef.current?.close().catch(() => {});
    acRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  async function play() {
    stop();
    await loadVideoFonts();
    const ac = new AudioContext();
    acRef.current = ac;
    await ac.resume();
    const start = ac.currentTime + 0.1;
    scheduleSoundtrack(ac, ac.destination, start, 0);
    setState("playing");
    const tick = () => {
      if (acRef.current !== ac) return;
      const t = ac.currentTime - start;
      if (t >= DURATION) {
        stop();
        setState("ended");
        setTime(DURATION);
        return;
      }
      paint(Math.max(0, t));
      setTime(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function pauseToStart() {
    stop();
    setState("idle");
    setTime(0);
  }

  async function download() {
    if (exporting) return;
    stop();
    setState("idle");
    setExporting({ p: 0, label: "Warming up the sleigh..." });
    try {
      const { blob, ext } = await exportVideo(kidRef.current, (p, label) => setExporting({ p, label: label ?? "" }));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Santa-video-${(kidRef.current.name || "for-you").replace(/[^A-Za-z0-9]/g, "")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      console.error(e);
      alert("Sorry, this browser couldn't make the video file. Try Chrome or Safari on a computer.");
    } finally {
      setExporting(null);
    }
  }

  const pct = Math.min(100, (time / DURATION) * 100);

  return (
    <div className={className}>
      <div className="group relative overflow-hidden rounded-md bg-[#081826] shadow-[0_30px_60px_-20px_rgba(0,0,0,.55)] ring-1 ring-black/10">
        <canvas ref={canvasRef} width={W} height={H} className="block aspect-video w-full" />
        {state !== "playing" && (
          <button
            type="button"
            onClick={play}
            aria-label={state === "ended" ? "Watch again" : "Play Santa's video"}
            className="absolute inset-0 flex items-end justify-start p-[3%] transition hover:bg-white/5"
          >
            <span className="flex items-center gap-2.5 rounded-full bg-berry px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-snow shadow-[4px_4px_0_rgba(0,0,0,.35)] transition group-hover:scale-105 sm:text-sm">
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M5 3.5v13l11-6.5z" />
              </svg>
              {state === "ended" ? "Watch again" : "Play with sound"}
            </span>
          </button>
        )}
        {state === "playing" && (
          <button type="button" onClick={pauseToStart} className="absolute inset-0" aria-label="Stop video" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
          <div className="h-full bg-gold-light" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {allowDownload && (
        <div className="mt-4">
          {exporting ? (
            <div className="rounded-sm border-2 border-ink bg-snow p-3">
              <div className="flex justify-between font-mono text-xs font-bold uppercase tracking-[0.12em]">
                <span>{exporting.label}</span>
                <span>{Math.round(exporting.p * 100)}%</span>
              </div>
              <div className="mt-2 h-2 bg-ink/10">
                <div className="h-full bg-berry transition-[width]" style={{ width: `${exporting.p * 100}%` }} />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={download}
              className="rounded-sm bg-ink px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-snow shadow-[4px_4px_0_var(--color-berry)] transition hover:-translate-y-0.5"
            >
              Download video (MP4)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
