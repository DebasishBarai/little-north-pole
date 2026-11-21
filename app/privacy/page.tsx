import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: `Privacy Policy · ${SITE.name}` };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {SITE.name} ({SITE.url.replace("https://", "")}) is run by {SITE.owner}, an individual based in {SITE.location}. This policy explains what we collect when you order a
        personalized Santa video and printables, and what we do with it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <b>Details you type for the video and letter:</b> your child&apos;s first name, and optionally their age, hometown, pet&apos;s name, one good thing they did, something they
          are working on and their wish. These are provided by you, the parent or guardian, not by the child.
        </li>
        <li>
          <b>Your email address</b>, used for your receipt and to help you find your order again.
        </li>
        <li>
          <b>Payment information</b>, which is entered on and handled by our payment provider, Dodo Payments. We never see or store your card details.
        </li>
        <li>
          <b>Basic, anonymous usage data</b> such as pages visited, collected by Vercel Web Analytics (no cookies) and by the Ship or Die hackathon traffic checker, which counts
          visits so the contest can verify traffic sources.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use your child&apos;s details only to make your video and printables, and your email only to deliver your order and answer support questions. We do not send marketing
        emails, we do not create accounts, and we never sell or share your information for advertising.
      </p>

      <h2>Where it is stored</h2>
      <p>
        The letter details are saved with your payment record at Dodo Payments so your download link keeps working. The video is made in your own browser, and the PDF is generated
        on demand and not stored. The website is hosted by Vercel.
      </p>

      <h2>How long we keep it</h2>
      <p>Order details are kept for as long as Dodo Payments keeps the payment record, which tax and accounting rules require. You can ask us to remove the letter details sooner.</p>

      <h2>Children&apos;s privacy</h2>
      <p>
        Our service is for parents and guardians. We do not knowingly collect information directly from children, and we only collect the minimum a parent chooses to share to
        personalize the letter. A parent or guardian can ask us to delete their child&apos;s details at any time by emailing {SITE.email}.
      </p>

      <h2>Your rights</h2>
      <p>You can ask to see, correct or delete the information we hold about your order. Email {SITE.email} from the address you used at checkout and we will reply within 7 days.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date at the top of this page.</p>
    </LegalPage>
  );
}
