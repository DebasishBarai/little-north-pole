import LetterSheet from "@/components/LetterSheet";
import OrderForm from "@/components/OrderForm";
import Snow from "@/components/Snow";
import Countdown from "@/components/Countdown";
import VideoPlayer from "@/components/VideoPlayer";
import { SAMPLE_KID } from "@/lib/letter";
import { CertificateMini, EnvelopeMini, NiceListMini } from "@/components/PackPages";
import { SITE } from "@/lib/site";

const INSIDE = [
  {
    kind: "letter",
    title: "A letter from Santa",
    body: "Written to your child by name. Santa mentions the good thing they did, their wish, their hometown and even the dog.",
  },
  {
    kind: "certificate",
    title: "Nice List certificate",
    body: "Gold seal, signed by Santa and Pepper Minty, Head Elf of Nice List Records. Fridge-worthy.",
  },
  {
    kind: "nicelist",
    title: "The actual Nice List",
    body: "Page 1,224 of the real thing, with their name highlighted, starred and checked twice.",
  },
  {
    kind: "envelope",
    title: "North Pole envelope",
    body: "Airmail stripes, a North Pole stamp and a Dec 24 postmark. Cut it out, wrap it, hide it.",
  },
];

const STEPS = [
  ["Tell Santa about them", "A name, one good thing they did this year and what they're hoping for. Two minutes, tops."],
  ["Watch it come to life", "The video and letter previews update as you type, so you see exactly what Santa will say."],
  ["Play it tonight", "Download the MP4 and the printables right after checkout. Cast it to the TV and watch their face."],
];

const FAQ = [
  ["What happens in the video?", "Santa opens the Nice List and writes your child's name, reads the Scout Elf report about their good deed, stamps their wish APPROVED, flies the sleigh route to your town and waves goodbye. About 50 seconds, with Jingle Bells playing."],
  ["Does Santa speak in the video?", "The story is told with music and words on screen, so it's perfect for reading aloud together. Little ones love hearing a grown-up read Santa's words to them."],
  ["How do we watch it?", "Play it right on the page, or download it as an MP4 that works on phones, tablets and TVs. No app, no account."],
  ["Is anything mailed to us?", "No. Everything is instant, so there's no shipping wait and no risk of it arriving after Christmas. Print the letter at home or at any print shop."],
  ["Will siblings get the same letter?", "No. Each child gets a differently worded letter built around their own good deed and wish, so they can compare without spotting a copy."],
  ["Can I change something after I buy?", "Your download link keeps working, and if you spot a typo just reply to your receipt email with the fix and we'll send a corrected copy."],
  ["What ages is it for?", "It's written for kids who still believe, usually around 3 to 10. Younger kids love having it read aloud. Older ones love the Nice List page."],
  ["Is my information stored?", "Only the details on the letter, attached to your payment so you can re-download. We don't create accounts or send marketing emails."],
];

function Stamp({ className = "" }: { className?: string }) {
  return (
    <div className={`stamp-edge h-[104px] w-[86px] p-[5px] drop-shadow-lg ${className}`}>
      <div className="flex h-full w-full flex-col items-center justify-between border-[5px] border-snow bg-pine-2 py-2 text-gold-light">
        <svg viewBox="0 0 40 46" className="w-9" aria-hidden>
          <path d="M20 4 L6 20 L13 20 L3 34 L12 34 L2 44 L38 44 L28 34 L37 34 L27 20 L34 20 Z" fill="#73a96b" />
          <path d="M20 0l1.6 3.4 3.6.4-2.7 2.4.8 3.6L20 8l-3.3 1.8.8-3.6-2.7-2.4 3.6-.4z" fill="#ecd99a" />
        </svg>
        <div className="whitespace-nowrap font-mono text-[8px] font-bold tracking-[0.06em]">NORTH POLE</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <div className="airmail h-2" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-pine text-snow">
        <Snow />
        <div className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-pine-2 blur-3xl" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <a href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-gold-light font-hand text-xl font-bold text-gold-light">❄</span>
            <span className="font-display text-xl tracking-tight">Little North Pole</span>
          </a>
          <a href="#write" className="hidden rounded-sm border-2 border-snow/70 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-snow hover:text-pine sm:block">
            Make my video
          </a>
        </nav>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-8 lg:grid-cols-[1.1fr_1fr] lg:pb-32 lg:pt-14">
          <div>
            <div className="rise label text-gold-light">Personal Santa video · Ready in 2 minutes</div>
            <h1 className="rise mt-5 font-display text-[44px] leading-[1.02] tracking-tight [animation-delay:.08s] sm:text-[64px]">
              Santa noticed
              <br />
              <span className="font-script text-[0.62em] leading-[1.7] text-gold-light">the good things</span>
              <br />
              your kid did this year.
            </h1>
            <p className="rise mt-6 max-w-xl text-xl leading-relaxed text-snow/80 [animation-delay:.16s]">
              Tell us one kind thing they did and what they&apos;re wishing for. Santa sends back a video starring your child, plus a letter, Nice List certificate and envelope to print tonight.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-4 [animation-delay:.24s]">
              <a href="#write" className="rounded-sm bg-berry px-7 py-4 font-mono text-[15px] font-bold uppercase tracking-[0.14em] text-snow shadow-[5px_5px_0_rgba(0,0,0,.35)] transition hover:-translate-y-0.5 hover:bg-berry-deep">
                Make my child&apos;s video
              </a>
              <a href="/api/pdf?sample=1" target="_blank" className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-snow/80 underline decoration-gold-light/60 underline-offset-[6px] hover:text-snow">
                Sample printables (PDF)
              </a>
            </div>
            <div className="rise mt-10 flex items-center gap-6 [animation-delay:.32s]">
              <Countdown className="-rotate-12 text-gold-light/90" />
              <p className="max-w-[16rem] text-[16px] leading-snug text-snow/70">
                From <b className="text-snow">$14</b>. No shipping, no waiting, no &ldquo;arrives Dec 27&rdquo;.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
            <div className="settle absolute -bottom-16 -right-6 hidden w-[42%] [--r:8deg] [animation-delay:.35s] sm:block">
              <LetterSheet kid={SAMPLE_KID} />
            </div>
            <div className="settle relative rounded-md bg-snow p-2.5 [--r:-2deg] [animation-delay:.15s]">
              <VideoPlayer kid={SAMPLE_KID} />
            </div>
            <Stamp className="absolute -left-4 -top-8 rotate-[-8deg]" />
            <div className="absolute -bottom-12 left-2 rotate-[-4deg] font-hand text-3xl text-gold-light">
              ↑ Emma&apos;s video. Press play!
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="grain">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="label text-berry">Plus, in the envelope</div>
              <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">Four printables to go with the video.</h2>
            </div>
            <p className="max-w-sm text-lg text-ink/70">Every page is personalized. Siblings each get their own video, letter, certificate and envelope.</p>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {INSIDE.map((it, i) => (
              <figure key={it.title} className="group">
                <div className="grid aspect-square place-items-center rounded-sm bg-snow/70 p-5 ring-1 ring-ink/10">
                  <div
                    role="img"
                    aria-label={it.title}
                    className={`shadow-[0_14px_30px_-12px_rgba(0,0,0,.45)] transition duration-500 group-hover:-translate-y-1 ${i % 2 ? "rotate-2" : "-rotate-2"} group-hover:rotate-0 ${
                      it.kind === "letter" || it.kind === "nicelist" ? "w-[74%]" : "w-full"
                    }`}
                  >
                    {it.kind === "letter" && <LetterSheet kid={SAMPLE_KID} />}
                    {it.kind === "certificate" && <CertificateMini />}
                    {it.kind === "nicelist" && <NiceListMini />}
                    {it.kind === "envelope" && <EnvelopeMini />}
                  </div>
                </div>
                <figcaption className="mt-5">
                  <div className="font-mono text-xs font-bold text-berry">NO. 0{i + 1}</div>
                  <div className="mt-1 font-display text-xl">{it.title}</div>
                  <p className="mt-2 text-[16px] leading-snug text-ink/70">{it.body}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER */}
      <section id="write" className="scroll-mt-4 bg-snow">
        <div className="airmail h-2" />
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 max-w-2xl">
            <div className="label text-berry">Santa&apos;s mail slot</div>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Tell Santa about your little one.</h2>
            <p className="mt-4 text-lg text-ink/70">The more specific the good deed, the more magical the video. &ldquo;Helped Grandma carry the groceries&rdquo; beats &ldquo;was good&rdquo;.</p>
          </div>
          <OrderForm />
        </div>
      </section>

      {/* HOW */}
      <section className="grain">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-3">
          {STEPS.map(([t, b], i) => (
            <div key={t} className="border-t-2 border-ink pt-6">
              <div className="font-mono text-sm font-bold text-berry">STEP {i + 1}</div>
              <div className="mt-2 font-display text-2xl">{t}</div>
              <p className="mt-3 text-lg leading-snug text-ink/70">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-snow">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="label text-berry">Notes for grown-ups</div>
          <h2 className="mt-3 font-display text-4xl">Questions from the elves&apos; inbox</h2>
          <div className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl">
                  {q}
                  <span className="font-mono text-2xl text-berry transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-lg leading-relaxed text-ink/75">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-berry text-snow">
        <Snow count={24} />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
          <div className="font-script text-3xl text-gold-light">Ho ho ho,</div>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">The sleigh leaves on the 24th. Their video can play tonight.</h2>
          <a href="#write" className="mt-10 rounded-sm bg-snow px-8 py-4 font-mono text-[15px] font-bold uppercase tracking-[0.14em] text-berry shadow-[5px_5px_0_rgba(0,0,0,.3)] transition hover:-translate-y-0.5">
            Make my child&apos;s video · $14
          </a>
        </div>
      </section>

      <footer className="bg-pine text-snow/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 font-mono text-xs">
          <span>© Little North Pole. Made with cocoa.</span>
          <nav className="flex flex-wrap gap-5">
            <a href="/privacy" className="hover:text-snow">Privacy</a>
            <a href="/terms" className="hover:text-snow">Terms</a>
            <a href="/refund" className="hover:text-snow">Refunds</a>
            <a href={`mailto:${SITE.email}`} className="hover:text-snow">{SITE.email}</a>
          </nav>
          <span className="w-full opacity-70">Santa Claus and his elves are characters of folklore. Letters are written for families to share.</span>
        </div>
      </footer>
    </main>
  );
}
