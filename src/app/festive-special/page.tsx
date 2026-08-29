import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FestiveCheckout from "@/components/FestiveCheckout";
import { FESTIVE_OFFER, isOfferPurchasable, money } from "@/lib/festive-offer";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "December Learning Boost | WanoTuts",
  description:
    "Buy four live, 60-minute one-on-one December lessons delivered through Microsoft Teams.",
};
export default function FestiveSpecial() {
  const offerOpen = isOfferPurchasable();
  return (
    <>
      <section className="bg-primary text-white px-6 py-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold tracking-[.16em] uppercase text-[#f2c466] mb-4">
              WanoTuts Festive Special
            </p>
            <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-5">
              {FESTIVE_OFFER.name}
            </h1>
            <p className="text-white/85 text-lg leading-relaxed">
              Four live, one-on-one lessons designed to keep learning moving
              through December. Each 60-minute lesson is delivered through
              Microsoft Teams.
            </p>
          </div>
          <Image
            src="/Images/festive-special.png"
            alt="WanoTuts December online learning Festive Special"
            width={1774}
            height={887}
            priority
            sizes="(min-width:1024px) 50vw,100vw"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </section>
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display font-bold text-3xl mb-5">
              Your four-lesson package
            </h2>
            <ul className="space-y-3 text-text-muted">
              {FESTIVE_OFFER.contents.map((x) => (
                <li key={x}>✓ {x}</li>
              ))}
            </ul>
            <h3 className="font-semibold text-lg mt-8 mb-3">
              Available subjects
            </h3>
            <p className="text-text-muted">
              {FESTIVE_OFFER.subjects.join(", ")}.
            </p>
          </div>
          <div className="grid gap-4">
            {Object.values(FESTIVE_OFFER.packages).map((p) => (
              <article
                key={p.id}
                className="border border-line rounded-xl p-6 bg-soft"
              >
                <h2 className="font-semibold text-lg">{p.label}</h2>
                <p className="mt-2">
                  {p.comparisonSupported && (
                    <s className="text-text-muted">
                      {money(p.regularMinor, p.currency)}
                    </s>
                  )}{" "}
                  <strong className="text-2xl text-primary ml-2">
                    {money(p.specialMinor, p.currency)}
                  </strong>
                </p>
                <p className="text-sm text-text-muted mt-1">
                  Four live, 60-minute one-on-one lessons
                  {p.id === "south_africa" ? " per subject" : ""}.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-10 bg-soft">
        <div className="max-w-5xl mx-auto border border-line bg-white rounded-2xl p-6 grid sm:grid-cols-[112px_1fr] gap-6 items-center">
          <div className="aspect-[4/5] relative overflow-hidden rounded-xl bg-soft w-28 mx-auto">
            <Image
              src="/Images/WhatsApp Image 2026-08-25 at 07.35.38.jpeg"
              alt="Kutlwano Sehume, the WanoTuts tutor"
              fill
              sizes="112px"
              className="object-cover object-center"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-accent mb-3">
              Your tutor
            </p>
            <h2 className="font-display text-2xl font-bold mb-3">
              Learn with Kutlwano Sehume.
            </h2>
            <p className="text-text-muted leading-relaxed">
              Kutlwano offers personalised lessons for international students
              and South African Grade 8–11 learners. She is based in Pretoria
              and works with students locally and internationally.
            </p>
            <Link
              href="/about"
              className="inline-block mt-4 font-semibold text-primary underline underline-offset-4"
            >
              Meet Kutlwano
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl font-bold mb-5">
            Dates and terms
          </h2>
          <ul className="space-y-3 text-text-muted">
            {FESTIVE_OFFER.terms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold mb-5">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold">How are lessons delivered?</h3>
              <p className="text-text-muted">
                Live online through Microsoft Teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">When can lessons be used?</h3>
              <p className="text-text-muted">
                Between 1 and 31 December 2026, subject to available booking
                times.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Does the package renew?</h3>
              <p className="text-text-muted">
                No. This is a once-off four-lesson package.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What happens after payment?</h3>
              <p className="text-text-muted">
                PayFast verifies the payment before the private 60-minute
                scheduling action is shown.
              </p>
            </div>
          </div>
        </div>
      </section>
      {offerOpen ? (
        <section id="checkout" className="px-4 sm:px-6 py-16 bg-soft">
          <div className="max-w-3xl mx-auto">
            <FestiveCheckout />
          </div>
        </section>
      ) : (
        <section className="px-6 py-16 bg-soft">
          <div className="max-w-3xl mx-auto bg-white border border-[#d2ae61] rounded-2xl p-8 text-center">
            <p className="text-[#8a651e] text-xs font-bold uppercase tracking-[.14em] mb-3">
              Festive Special
            </p>
            <h2 className="font-display text-3xl font-bold mb-3">
              This offer has ended
            </h2>
            <p className="text-text-muted">
              New December Learning Boost purchases are now closed. Existing
              customers can continue to use their confirmation and scheduling
              links.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-6 font-semibold text-primary underline underline-offset-4"
            >
              Contact WanoTuts
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
