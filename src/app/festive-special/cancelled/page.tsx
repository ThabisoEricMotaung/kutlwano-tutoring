import Link from "next/link";
export const metadata = {
  title: "Payment cancelled | WanoTuts",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <section className="px-6 py-20 max-w-2xl mx-auto text-center">
      <h1 className="font-display text-4xl font-bold mb-4">
        Payment cancelled
      </h1>
      <p className="text-text-muted mb-8">
        No package has been confirmed and no successful payment is being
        claimed.
      </p>
      <Link
        href="/festive-special#checkout"
        className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-sm"
      >
        Return to checkout
      </Link>
    </section>
  );
}
