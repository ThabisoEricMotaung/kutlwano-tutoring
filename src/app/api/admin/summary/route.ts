import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getEftAdminSummary } from "@/lib/db";

export async function GET(request: Request) {
  if (!isAdminRequest(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await getEftAdminSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error(
      "Admin summary failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Could not load summary" },
      { status: 503 },
    );
  }
}
