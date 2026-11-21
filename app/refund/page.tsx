import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: `Refund Policy · ${SITE.name}` };

export default function Refund() {
  return (
    <LegalPage title="Refund Policy">
      <p>We want your little one&apos;s Santa moment to be perfect. If it isn&apos;t, we&apos;ll make it right.</p>

      <h2>Typos and fixes</h2>
      <p>
        Spelled a name wrong or want to change a detail? Reply to your receipt email or write to {SITE.email} with your payment ID and the correction, and we will send a corrected
        video and PDF at no charge.
      </p>

      <h2>Full refunds</h2>
      <p>
        If you are not happy with your pack, or it didn&apos;t work for you, email {SITE.email} within 14 days of purchase with your payment ID and we will refund you in full. No
        hard questions.
      </p>

      <h2>How refunds are paid</h2>
      <p>
        Refunds are issued through Dodo Payments to your original payment method. Depending on your bank, they usually appear within 5 to 10 business days.
      </p>
    </LegalPage>
  );
}
