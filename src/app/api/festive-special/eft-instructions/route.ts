import { NextResponse } from "next/server";
import { getPurchase } from "@/lib/db";
import { getBankingDetails } from "@/lib/site-details";

export async function GET(request: Request) {
  try {
    const ref = new URL(request.url).searchParams.get("reference");
    if (!ref)
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });

    const p = await getPurchase(ref);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (p.payment_method !== "eft") {
      return NextResponse.json(
        { error: "Not an EFT purchase" },
        { status: 400 }
      );
    }

    const banking = getBankingDetails();

    // Ensure banking details are configured
    if (!banking.bankAccountNumber || !banking.bankAccountHolder) {
      return NextResponse.json(
        { error: "EFT instructions not yet configured" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      reference: p.reference,
      status: p.status,
      amountMinor: p.display_amount_minor,
      currency: p.currency,
      businessName: banking.businessName,
      bankName: banking.bankName,
      bankAccountHolder: banking.bankAccountHolder,
      bankAccountNumber: banking.bankAccountNumber,
      bankAccountType: banking.bankAccountType || undefined,
      bankBranchCode: banking.bankBranchCode || undefined,
      disclosureText: `WanoTuts is a tutoring service operated by ${banking.businessName}.`,
    });
  } catch (error) {
    console.error(
      "EFT instructions unavailable",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "EFT instructions unavailable" },
      { status: 503 }
    );
  }
}
