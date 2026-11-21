"use client";
import { useState } from "react";
import type { Kid } from "@/lib/letter";
import VideoPlayer from "./VideoPlayer";

export default function OrderVideos({ kids }: { kids: Kid[] }) {
  const [active, setActive] = useState(0);
  if (!kids.length) return null;
  return (
    <div className="mt-10">
      {kids.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {kids.map((k, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full border-2 px-4 py-1.5 font-mono text-sm font-bold ${i === active ? "border-ink bg-ink text-snow" : "border-ink/25 text-ink/70"}`}
            >
              {k.name}&apos;s video
            </button>
          ))}
        </div>
      )}
      <VideoPlayer key={active} kid={kids[active]} allowDownload />
      <p className="mt-3 text-[15px] text-ink/60">The MP4 is made right here in your browser and takes about 20 seconds. It plays on phones, tablets and TVs.</p>
    </div>
  );
}
