import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { verifyEftPayment } from "@/lib/db";

const verifyPaymentSchema = z.object({
  reference: z.string().trim().min(1),
});

export async function POST(request: Request) {
  if (!isAdminRequest(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = verifyPaymentSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Missing booking reference" }, { status: 400 });

  try {
    const result = await verifyEftPayment(parsed.data.reference);

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
