import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin-auth";
import { listEftPurchases } from "@/lib/db";
import AdminDashboard from "@/components/AdminDashboard";

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
      <section className="px-6 py-16 bg-soft min-h-[70vh]">
        <div className="max-w-sm mx-auto bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-2xl font-bold mb-5">
            WanoTuts admin
          </h1>
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
              className="w-full bg-primary text-white font-semibold rounded-lg px-4 py-2"
            >
              Log in
            </button>
          </form>
        </div>
      </section>
    );
  }

  const purchases = await listEftPurchases();

  return (
    <section className="px-4 sm:px-6 py-10 bg-soft min-h-[70vh]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">
            EFT payments awaiting verification
          </h1>
          <form method="post" action="/api/admin/logout">
            <button
              type="submit"
              className="text-sm font-semibold text-primary underline underline-offset-4"
            >
              Log out
            </button>
          </form>
        </div>
        <AdminDashboard initialPurchases={purchases} />
      </div>
    </section>
  );
}
