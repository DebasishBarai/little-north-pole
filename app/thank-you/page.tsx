import Link from "next/link";
import { getPayment, kidsFromPayment } from "@/lib/dodo";
import OrderVideos from "@/components/OrderVideos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Santa video and letters · Checked Twice", robots: { index: false } };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grain min-h-screen">
      <div className="airmail h-2" />
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/" className="font-display text-xl">Checked Twice</Link>
        <div className="mt-12">{children}</div>
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
      <p className="mt-4 text-lg text-ink/70">Paste the payment ID from your receipt email. It starts with <span className="font-mono">pay_</span>.</p>
      <form className="mt-8 flex gap-3" action="/thank-you">
        <input name="payment_id" className="field flex-1 !font-mono !text-lg" placeholder="pay_..." required />
        <button className="rounded-sm bg-berry px-5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-snow">Find</button>
      </form>
    </Shell>
  );
}

export default async function ThankYou({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const paymentId = sp.payment_id ?? "";
  if (!paymentId) return <FindOrder />;

  const payment = await getPayment(paymentId);
  if (!payment) return <FindOrder note="We couldn't find that order. Double check the payment ID." />;

  if (payment.status !== "succeeded") {
    const failed = ["failed", "cancelled"].includes(payment.status ?? "");
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

  const kids = kidsFromPayment(payment) ?? [];
  const names = kids.map((k) => k.name);
  const nameText = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0] ?? "your little one";
  const href = `/api/pdf?payment_id=${encodeURIComponent(paymentId)}`;

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
