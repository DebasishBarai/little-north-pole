import Link from "next/link";
import { SITE } from "@/lib/site";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="grain min-h-screen">
      <div className="airmail h-2" />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="font-display text-xl">
          {SITE.name}
        </Link>
        <h1 className="mt-12 font-display text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-ink/55">Last updated {SITE.updated}</p>
        <div className="legal mt-10 space-y-5 text-lg leading-relaxed text-ink/85">{children}</div>
        <p className="mt-14 border-t border-ink/15 pt-6 text-[15px] text-ink/60">
          Questions? Email <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </main>
  );
}
