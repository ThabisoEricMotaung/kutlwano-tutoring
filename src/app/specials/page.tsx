import type { Metadata } from "next";
import SpecialOffer from "@/components/SpecialOffer";
import { ACTIVE_SPECIALS } from "@/lib/specials";

export const metadata: Metadata = {
  title: "WanoTuts Specials | Holiday & Revision Classes",
  description:
    "Explore current WanoTuts holiday classes, revision programmes and tutoring specials for learners in Pretoria and online.",
};

export default function SpecialsPage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 py-12 text-center md:py-16">
        <p className="mb-4 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-accent">WanoTuts Specials</p>
        <h1 className="mb-4 font-display text-3xl font-bold leading-tight md:text-[40px]">More learning. Better value.</h1>
        <p className="mx-auto max-w-xl text-[17px] leading-relaxed text-text-muted">
          Holiday programmes, focused revision sessions and special learning packages from WanoTuts.
        </p>
      </section>
      {ACTIVE_SPECIALS.map((special) => <SpecialOffer key={special.id} special={special} />)}
    </>
  );
}
