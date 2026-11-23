import Link from "next/link";
import { getPurchase, kidsFromPurchase } from "@/lib/polar";
import { SITE } from "@/lib/site";
import OrderVideos from "@/components/OrderVideos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Santa video and letters · Little North Pole", robots: { index: false } };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grain min-h-screen">
      <div className="airmail h-2" />
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/" className="font-display text-xl">Little North Pole</Link>
        <div className="mt-12">{children}</div>
        <p className="mt-16 flex gap-5 font-mono text-xs text-ink/50">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund">Refunds</Link>
        </p>
      </div>
    </main>
  );
}

function FindOrder({ note }: { note?: string }) {
  return (
    <Shell>
      <div className="label text-berry">Lost your letters?</div>
      <h1 className="mt-3 font-display text-4xl">Find your order</h1>
      {note && <p className="mt-4 text-lg text-berry">{note}</p>}
      <p className="mt-4 text-lg text-ink/70">
        Paste your order ID from your Polar receipt. Can&apos;t find it? Email <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> and the elves will send your link.
      </p>
      <form className="mt-8 flex gap-3" action="/thank-you">
        <input name="order_id" className="field flex-1 !font-mono !text-lg" placeholder="Order ID" required />
        <button className="rounded-sm bg-berry px-5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-snow">Find</button>
      </form>
    </Shell>
  );
}

export default async function ThankYou({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const id = (sp.checkout_id ?? sp.order_id ?? "").trim();
  if (!id) return <FindOrder />;

  const purchase = await getPurchase(id);
  if (!purchase) return <FindOrder note="We couldn't find that order. Double check the order ID." />;

  if (purchase.state !== "paid") {
    const failed = purchase.state === "failed";
    return (
      <Shell>
        {!failed && <meta httpEquiv="refresh" content="4" />}
        <div className="label text-berry">{failed ? "Payment didn't go through" : "Almost there"}</div>
        <h1 className="mt-3 font-display text-4xl">{failed ? "The sleigh couldn't take off." : "The elves are confirming your payment..."}</h1>
        <p className="mt-4 text-lg text-ink/70">
          {failed ? "No charge was made. You can head back and try again." : "This page refreshes by itself. It usually takes a few seconds."}
        </p>
        {failed && (
          <Link href="/#write" className="mt-8 inline-block rounded-sm bg-berry px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.14em] text-snow">
            Try again
          </Link>
        )}
      </Shell>
    );
  }

  const kids = kidsFromPurchase(purchase) ?? [];
  const names = kids.map((k) => k.name);
  const nameText = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0] ?? "your little one";
  const href = `/api/pdf?id=${encodeURIComponent(id)}`;

  return (
    <Shell>
      <div className="label text-berry">Special delivery</div>
      <h1 className="mt-3 font-display text-5xl leading-tight">Santa&apos;s video for {nameText} is ready.</h1>
      <p className="mt-5 text-lg text-ink/70">Bookmark this page. Your links keep working, so you can watch, download and print again anytime.</p>

      <OrderVideos kids={kids} />

      <div className="label mt-14 text-pine-2">The printables</div>
      <p className="mt-2 text-lg text-ink/70">Letter, Nice List certificate, envelope and the Nice List page, in one PDF.</p>
      <div className="mt-5 flex flex-wrap gap-4">
        <a href={href} className="rounded-sm bg-berry px-7 py-4 font-mono text-[15px] font-bold uppercase tracking-[0.14em] text-snow shadow-[5px_5px_0_var(--color-ink)] transition hover:-translate-y-0.5">
          Download the PDF
        </a>
        <a href={`${href}&view=1`} target="_blank" className="self-center font-mono text-sm font-bold uppercase tracking-[0.14em] underline underline-offset-[6px]">
          Open in browser
        </a>
      </div>

      <div className="mt-14 border-t-2 border-ink pt-8">
        <div className="label text-pine-2">Elf tips</div>
        <ul className="mt-4 space-y-3 text-lg leading-snug text-ink/80">
          <li>Play the video on the TV: cast it from your phone, or plug in a laptop. Watch their face when their name shows up on the Nice List.</li>
          <li>Print at <b>100% / actual size</b>. Turn off &ldquo;fit to page&rdquo; for the crispest borders.</li>
          <li>Cream or ivory cardstock makes it feel like real North Pole paper. Plain white works fine too.</li>
          <li>Hide the envelope somewhere fun: the mailbox, the tree, or next to the cookie plate on Christmas Eve.</li>
          <li>Spotted a typo? Reply to your receipt email with the fix and we&apos;ll send a corrected copy.</li>
        </ul>
      </div>
    </Shell>
  );
}
