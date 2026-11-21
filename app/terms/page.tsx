import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: `Terms of Service · ${SITE.name}` };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms apply when you use {SITE.url.replace("https://", "")} or buy from {SITE.name}, a service run by {SITE.owner}, an individual based in {SITE.location}. By placing
        an order you agree to them.
      </p>

      <h2>What you are buying</h2>
      <p>
        A digital pack made for your child: an animated video from Santa that plays in your browser and can be downloaded as a video file, plus a printable PDF with a letter, a Nice
        List certificate, an envelope and a Nice List page. Nothing is shipped. The single pack covers one child and the sibling pack covers two to four children.
      </p>

      <h2>Payment</h2>
      <p>
        Orders are processed by Dodo Payments, which acts as the merchant of record and handles payment, invoicing and applicable sales taxes. Prices are shown in US dollars before
        checkout.
      </p>

      <h2>Delivery</h2>
      <p>
        Your video and PDF are available immediately after payment on your order page. Keep the link, or use the payment ID from your receipt to find your order again. The video
        file is created in your browser, so we recommend an up-to-date version of Chrome, Edge or Safari.
      </p>

      <h2>Your content</h2>
      <p>
        You are responsible for the details you enter, and you confirm you are the child&apos;s parent or guardian or have their permission. Please don&apos;t enter anything
        offensive or anyone else&apos;s private information. You may use your pack for personal and family use, including sharing it with relatives.
      </p>

      <h2>Santa</h2>
      <p>
        Santa Claus, his elves and the North Pole are characters of folklore. The video and letters are written for families to enjoy together and are not affiliated with any
        other Santa service.
      </p>

      <h2>Refunds</h2>
      <p>
        See our <Link href="/refund">Refund Policy</Link>.
      </p>

      <h2>Liability</h2>
      <p>
        We work hard to make every pack right, but the service is provided as is. To the extent allowed by law, our total liability for any order is limited to the amount you paid
        for it.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms: {SITE.email}.</p>
    </LegalPage>
  );
}
