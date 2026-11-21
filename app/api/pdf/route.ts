import { renderPack } from "@/lib/pdf";
import { SAMPLE_KID } from "@/lib/letter";
import { getPayment, kidsFromPayment } from "@/lib/dodo";

export const runtime = "nodejs";
export const maxDuration = 30;

function pdfResponse(bytes: Uint8Array, filename: string, inline: boolean) {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": inline ? "public, max-age=3600" : "private, no-store",
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  if (url.searchParams.get("sample") === "1") {
    const bytes = await renderPack([SAMPLE_KID], { sample: true });
    return pdfResponse(bytes, "Little-North-Pole-Sample.pdf", true);
  }

  const paymentId = url.searchParams.get("payment_id") ?? "";
  const payment = await getPayment(paymentId);
  if (!payment) return new Response("We couldn't find that order.", { status: 404 });
  if (payment.status !== "succeeded") return new Response("This payment hasn't completed yet.", { status: 402 });

  const kids = kidsFromPayment(payment);
  if (!kids) return new Response("This order has no letter details. Please reply to your receipt email.", { status: 422 });

  const bytes = await renderPack(kids);
  const names = kids.map((k) => k.name.replace(/[^A-Za-z0-9]/g, "")).filter(Boolean).join("-") || "Your-Child";
  return pdfResponse(bytes, `Letters-from-Santa-${names}.pdf`, url.searchParams.get("view") === "1");
}
