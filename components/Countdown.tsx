"use client";
import { useEffect, useState } from "react";

function daysLeft() {
  const now = new Date();
  let xmas = new Date(now.getFullYear(), 11, 25);
  if (now > new Date(now.getFullYear(), 11, 25, 23, 59)) xmas = new Date(now.getFullYear() + 1, 11, 25);
  return Math.max(0, Math.ceil((xmas.getTime() - now.getTime()) / 86400000));
}

export default function Countdown({ className = "" }: { className?: string }) {
  const [d, setD] = useState<number | null>(null);
  useEffect(() => setD(daysLeft()), []);
  return (
    <div className={`relative grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full border-2 border-current text-center ${className}`}>
      <div className="absolute inset-[5px] rounded-full border border-current opacity-70" />
      <div>
        <div className="font-mono text-[9px] font-bold tracking-[0.18em]">NORTH POLE</div>
        <div className="font-display text-[26px] leading-none">{d ?? "--"}</div>
        <div className="font-mono text-[9px] font-bold tracking-[0.12em]">{d === 0 ? "IT'S TODAY" : "DAYS TO GO"}</div>
      </div>
    </div>
  );
}
