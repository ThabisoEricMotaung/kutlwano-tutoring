import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { parseZarAmountToMinor } from "@/lib/amount";
import { verifyEftPayment } from "@/lib/db";

const verifyPaymentSchema = z.object({
  reference: z.string().trim().min(1),
  receivedAmount: z.string().trim().min(1),
});

export async function POST(request: Request) {
  if (!isAdminRequest(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = verifyPaymentSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "A booking reference and the amount received are required." },
      { status: 400 },
    );

  const receivedMinor = parseZarAmountToMinor(parsed.data.receivedAmount);
  if (receivedMinor === null)
    return NextResponse.json(
      { error: "Enter a valid amount, e.g. 450.00." },
      { status: 400 },
    );

  try {
    const result = await verifyEftPayment(parsed.data.reference, receivedMinor);

    switch (result.outcome) {
      case "not_found":
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      case "rejected":
        return NextResponse.json(
          {
            error:
              "This booking cannot be verified here: it is not an EFT booking awaiting payment.",
            purchase: result.purchase,
          },
          { status: 409 },
        );
      case "amount_mismatch":
        return NextResponse.json(
          {
            error: "Payment does not match the amount due.",
            expectedMinor: result.expectedMinor,
            receivedMinor: result.receivedMinor,
            outstandingMinor: Math.max(
              0,
              result.expectedMinor - result.receivedMinor,
            ),
            overpaymentMinor: Math.max(
              0,
              result.receivedMinor - result.expectedMinor,
            ),
          },
          { status: 409 },
        );
      case "already_verified":
        return NextResponse.json({
          alreadyVerified: true,
          purchase: result.purchase,
        });
      case "verified":
        return NextResponse.json({
          alreadyVerified: false,
          purchase: result.purchase,
        });
    }
  } catch (error) {
    console.error(
      "Admin payment verification failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Verification could not be completed. Please try again." },
      { status: 503 },
    );
  }
}
