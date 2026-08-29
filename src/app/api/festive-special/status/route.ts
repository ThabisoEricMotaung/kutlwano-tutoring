import { NextResponse } from "next/server";
import { getPurchase } from "@/lib/db";
export async function GET(request: Request) {
  try {
    const ref = new URL(request.url).searchParams.get("reference");
    if (!ref)
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    const p = await getPurchase(ref);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      reference: p.reference,
      status: p.status,
      paymentMethod: p.payment_method,
      packageId: p.package_id,
      subject: p.subject,
      currency: p.currency,
      amountMinor: p.display_amount_minor,
      eftReceivedAmountMinor: p.eft_received_amount_minor ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Purchase status unavailable" },
      { status: 503 },
    );
  }
}
