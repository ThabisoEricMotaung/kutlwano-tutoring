import type { Metadata } from "next";
import PurchaseConfirmation from "@/components/PurchaseConfirmation";
export const metadata: Metadata = {
  title: "Purchase status | WanoTuts",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  return (
    <section className="px-6 py-16 bg-soft min-h-[70vh]">
      <div className="max-w-4xl mx-auto">
        {reference ? (
          <PurchaseConfirmation reference={reference} />
        ) : (
          <div className="bg-white p-8 rounded-xl">
            <h1 className="font-display text-3xl font-bold">
              Missing order reference
            </h1>
            <p className="text-text-muted mt-3">
              No purchase can be confirmed from this link.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
