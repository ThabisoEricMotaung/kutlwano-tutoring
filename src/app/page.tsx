import Link from "next/link";
import { FEATURED_SPECIAL } from "@/lib/specials";

const SERVICES = [
  {
    title: "Personalised Learning",
    desc: "Lessons shaped around how you actually learn, not a fixed curriculum.",
  },
  {
    title: "Language Practice",
    desc: "Real conversation practice to build fluency and confidence.",
  },
  {
    title: "Grammar & Spellcheck",
    desc: "Careful, detailed feedback that actually improves your writing.",
  },
  {
    title: "Language Coaching",
    desc: "Ongoing coaching for learners working toward a specific goal.",
  },
];

export default function Home() {
  const special = FEATURED_SPECIAL;

  return (
    <>
      {/* Hero */}
      <section className="bg-soft px-6 py-24 md:py-28 text-center">
        <div className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-accent mb-5">
          One-on-One Lessons
        </div>
        <h1 className="font-display font-bold text-[32px] md:text-[48px] leading-[1.15] max-w-3xl mx-auto mb-6">
          Learning that finally makes sense, one lesson at a time.
        </h1>
        <p className="text-[17px] leading-relaxed text-text-muted max-w-xl mx-auto mb-9">
          Personalised tutoring in English, Afrikaans, Mathematics and the
          Sciences — for international students and South African learners
          in Grade 8–11.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap mb-11">
          <Link
            href="/contact"
            className="font-semibold text-sm px-6 py-3 rounded-sm bg-primary text-white hover:bg-accent transition-colors"
          >
            Book a Lesson
          </Link>
          <Link
            href="/pricing"
            className="font-semibold text-sm px-6 py-3 rounded-sm border-[1.5px] border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            See Pricing
          </Link>
        </div>

        {/* Pricing tracks */}
        <div className="flex flex-col sm:flex-row gap-5 max-w-2xl mx-auto text-left">
          <div className="flex-1 bg-bg border border-line rounded-md p-6">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
              International
            </div>
            <div className="font-display font-bold text-[26px] mb-1">
              $25/hr
            </div>
            <p className="text-[13px] text-text-muted leading-relaxed">
              English language coaching, conversation practice &amp; grammar
              support.
            </p>
          </div>
          <div className="flex-1 bg-bg border border-line rounded-md p-6">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
              South Africa · Grade 8–11
            </div>
            <div className="font-display font-bold text-[26px] mb-1">
              R500/subject
            </div>
            <p className="text-[13px] text-text-muted leading-relaxed">
              Per month. English, Afrikaans, Maths, Technical Maths,
              Technical Science, Natural Science &amp; Physical Sciences.
            </p>
          </div>
        </div>
      </section>

      {special && (
        <section className="border-y border-line bg-soft px-6 py-7">
          <Link
            href="/specials"
            className="group mx-auto grid max-w-5xl gap-4 rounded-md border border-line bg-white p-5 transition-colors hover:border-accent sm:grid-cols-[1fr_auto] sm:items-center md:px-7"
          >
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
                {special.eyebrow}
              </p>
              <h2 className="font-display text-xl font-bold md:text-2xl">
                {special.shortTitle}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                {special.subjects.length} subjects · {special.formats.join(" + ")}
                <span className="mx-2 hidden sm:inline">·</span>
                <span className="block font-semibold text-primary sm:inline">
                  {special.price} for the duration of the holidays
                </span>
              </p>
            </div>
            <span className="text-sm font-semibold text-primary group-hover:text-accent">
              View special →
            </span>
          </Link>
        </section>
      )}

      {/* Services */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-3">
          What every lesson includes
        </h2>
        <p className="text-text-muted text-center max-w-lg mx-auto mb-12">
          Every session is built around you — here&apos;s what that looks
          like in practice.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((s) => (
            <div key={s.title} className="border border-line rounded-md p-6">
              <div className="w-8 h-8 rounded-full bg-soft border border-line mb-4" />
              <h3 className="font-sans font-semibold text-base mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-primary px-6 py-16 text-center">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-4">
          Ready to start learning?
        </h2>
        <p className="text-white/80 max-w-md mx-auto mb-8">
          Book your first lesson today, or get in touch with any questions.
        </p>
        <Link
          href="/contact"
          className="inline-block font-semibold text-sm px-7 py-3.5 rounded-sm bg-white text-primary hover:bg-soft transition-colors"
        >
          Book a Lesson
        </Link>
      </section>
    </>
  );
}
