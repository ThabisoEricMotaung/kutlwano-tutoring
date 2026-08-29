import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listEftPurchases, type AdminPurchaseView } from "@/lib/db";

function parseView(raw: string | null): AdminPurchaseView {
  return raw === "verified" || raw === "all" ? raw : "awaiting";
}

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const search = url.searchParams.get("q") || undefined;
  const view = parseView(url.searchParams.get("view"));

  try {
    const purchases = await listEftPurchases({ search, view });
    return NextResponse.json({ purchases, view });
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
