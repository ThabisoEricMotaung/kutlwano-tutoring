import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { getEftAdminSummary, listEftPurchases } from "@/lib/db";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | WanoTuts",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const authenticated = isValidAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!authenticated) {
    return (
      <section className="px-6 py-16 bg-soft min-h-[70vh] flex items-center">
        <div className="max-w-sm mx-auto w-full bg-white border border-line rounded-2xl shadow-sm p-8">
          <Image
            src="/Images/wanotuts-logo.svg"
            alt="WanoTuts"
            width={578}
            height={100}
            className="h-8 w-auto mb-6"
          />
          <h1 className="font-display text-2xl font-bold mb-1">
            Payments admin
          </h1>
          <p className="text-sm text-text-muted mb-5">
            Sign in to review and verify EFT payments.
          </p>
          {error ? (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              Incorrect password.
            </p>
          ) : null}
          <form method="post" action="/api/admin/login" className="space-y-4">
            <div>
              <label htmlFor="password" className="text-sm font-semibold">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                className="mt-1 w-full border border-line rounded-lg px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold rounded-lg px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Log in
            </button>
          </form>
        </div>
      </section>
    );
  }

  const [purchases, summary] = await Promise.all([
    listEftPurchases(),
    getEftAdminSummary().catch(() => null),
  ]);

  return (
    <section className="px-4 sm:px-6 py-8 bg-soft min-h-[70vh]">
      <div className="max-w-6xl mx-auto space-y-6">
        <AdminHeader />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
            EFT payments
          </p>
          <h1 className="font-display text-3xl font-bold">
            Awaiting verification
          </h1>
          <p className="text-text-muted mt-2 max-w-2xl">
            Review EFT payments and verify them once the bank reference and
            amount match.
          </p>
        </div>
        <AdminDashboard initialPurchases={purchases} initialSummary={summary} />
      </div>
    </section>
  );
}
