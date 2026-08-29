import Link from "next/link";

export const metadata = { title: "Pricing | Kutlwano Tutoring" };

export default function Pricing() {
  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <div className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-accent mb-4 text-center">
        Pricing
      </div>
      <h1 className="font-display font-bold text-3xl md:text-[40px] leading-tight mb-14 text-center">
        Simple, transparent pricing.
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* International */}
        <div className="border border-line rounded-md p-8">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-3">
            International Students
          </div>
          <div className="font-display font-bold text-4xl mb-1">
            $25
            <span className="text-lg font-sans font-medium text-text-muted">
              /hour
            </span>
          </div>
          <p className="text-sm text-text-muted mb-6">Billed per lesson</p>
          <ul className="space-y-2.5 text-[15px] text-text-muted mb-8">
            <li>— Personalised learning</li>
            <li>— Language practice</li>
            <li>— Grammar &amp; spellcheck</li>
            <li>— Language coaching</li>
          </ul>
          <Link
            href="/contact"
            className="block text-center font-semibold text-sm px-6 py-3 rounded-sm border-[1.5px] border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            Book a Lesson
          </Link>
        </div>

        {/* SA Students */}
        <div className="border-2 border-primary rounded-md p-8 relative">
          <div className="absolute -top-3 left-8 bg-primary text-white text-[11px] font-bold tracking-[0.08em] uppercase px-3 py-1 rounded-sm">
            Grade 8–11
          </div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-3">
            South African Students
          </div>
          <div className="font-display font-bold text-4xl mb-1">
            R500
            <span className="text-lg font-sans font-medium text-text-muted">
              /subject/month
            </span>
          </div>
          <p className="text-sm text-text-muted mb-6">
            English, Afrikaans, Mathematics, Technical Mathematics, Technical
            Science, Natural Science, Physical Sciences
          </p>
          <ul className="space-y-2.5 text-[15px] text-text-muted mb-8">
            <li>— Personalised learning</li>
            <li>— Language practice</li>
            <li>— Grammar &amp; spellcheck</li>
            <li>— Language coaching</li>
          </ul>
          <Link
            href="/contact"
            className="block text-center font-semibold text-sm px-6 py-3 rounded-sm bg-primary text-white hover:bg-accent transition-colors"
          >
            Book a Lesson
          </Link>
        </div>
      </div>
    </section>
  );
}
