import { NextResponse } from "next/server";
import { completePurchase, getPurchase } from "@/lib/db";
import { payfastHost, validSignature } from "@/lib/payfast";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const params = new URLSearchParams(raw);
    const data = Object.fromEntries(params.entries());
    const pass = process.env.PAYFAST_PASSPHRASE,
      merchant = process.env.PAYFAST_MERCHANT_ID;
    if (
      !pass ||
      !merchant ||
      data.merchant_id !== merchant ||
      !validSignature(data, pass)
    )
      return new NextResponse("Invalid", { status: 400 });
    const validation = await fetch(`${payfastHost()}/eng/query/validate`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: raw,
      cache: "no-store",
    });
    if (!(await validation.text()).trim().startsWith("VALID"))
      return new NextResponse("Invalid", { status: 400 });
    const purchase = await getPurchase(data.m_payment_id);
    if (!purchase)
      return new NextResponse("Unknown reference", { status: 404 });
    if (
      Math.abs(
        Number(purchase.charged_zar_minor) / 100 - Number(data.amount_gross),
      ) > 0.01
    )
      return new NextResponse("Amount mismatch", { status: 400 });
    const status =
      data.payment_status === "COMPLETE"
        ? "completed"
        : data.payment_status === "FAILED"
          ? "failed"
          : "pending";
    await completePurchase(
      data.m_payment_id,
      data.pf_payment_id || `pending-${data.m_payment_id}`,
      status,
    );
    return new NextResponse("OK");
  } catch (error) {
    console.error(
      "PayFast ITN failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return new NextResponse("Error", { status: 500 });
  }
}
