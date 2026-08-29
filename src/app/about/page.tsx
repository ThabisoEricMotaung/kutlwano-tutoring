import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Kutlwano Sehume | WanoTuts",
  description:
    "Meet Kutlwano Sehume, the Pretoria-based tutor behind WanoTuts and personalised one-on-one lessons.",
};

export default function About() {
  return (
    <>
      <section className="px-6 py-16 md:py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] gap-10 md:gap-14 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-soft shadow-sm order-2 md:order-1">
            <Image
              src="/Images/WhatsApp Image 2026-08-25 at 07.35.38.jpeg"
              alt="Kutlwano Sehume, the tutor behind WanoTuts"
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-accent mb-4">
              About WanoTuts
            </p>
            <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-7">
              Hi, I&apos;m Kutlwano Sehume.
            </h1>
            <div className="space-y-5 text-[17px] leading-relaxed text-text-muted">
              <p>
                I offer one-on-one lessons built around the way each student
                actually learns — not a one-size-fits-all curriculum. Whether
                you&apos;re an international student working on English fluency,
                or a Grade 8–11 learner in South Africa preparing for exams,
                every session is personalised to where you are and where you
                want to go.
              </p>
              <p>
                My approach combines personalised learning, real language
                practice, careful grammar and spellcheck feedback, and ongoing
                coaching — so progress is steady, not rushed.
              </p>
              <p>
                I&apos;m based in Pretoria, South Africa, and work with students
                both locally and internationally.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
