import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listEftPurchases } from "@/lib/db";

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const search = new URL(request.url).searchParams.get("q") || undefined;
  try {
    const purchases = await listEftPurchases(search);
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error(
      "Admin purchase list failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Could not load bookings" },
      { status: 503 },
    );
  }
}
