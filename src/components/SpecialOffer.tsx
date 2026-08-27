import Link from "next/link";
import type { Special } from "@/lib/specials";

export default function SpecialOffer({ special }: { special: Special }) {
  return (
    <article className="border-y border-line bg-soft" id={special.slug}>
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 md:grid-cols-[1.15fr_.85fr] md:gap-14 md:py-14">
        <div>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            {special.eyebrow}
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold leading-tight md:text-[40px]">
            Make the school break count.
          </h2>
          <p className="mb-8 max-w-2xl text-[16px] leading-relaxed text-text-muted">
            {special.description}
          </p>
          <div className="border-t border-line pt-6">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
              Subjects
            </h3>
            <ul className="flex flex-wrap gap-2" aria-label="Available subjects">
              {special.subjects.map((subject) => (
                <li key={subject} className="rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium">
                  {subject}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-l-0 border-line md:border-l md:pl-10">
          <div className="border-b border-line pb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
              Programme price
            </p>
            <p className="mt-2 font-display text-5xl font-bold leading-none text-primary md:text-6xl">
              {special.price}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
              {special.priceDescription}
            </p>
          </div>
          <dl className="grid gap-5 py-6 text-sm sm:grid-cols-2 md:grid-cols-1">
            <div>
              <dt className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">Learning format</dt>
              <dd className="font-medium">{special.formats.join(" · ")}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">Location</dt>
              <dd className="leading-relaxed text-text-muted">
                {special.location.map((line) => <span className="block" key={line}>{line}</span>)}
              </dd>
            </div>
          </dl>
          <Link href={special.ctaDestination} className="inline-block rounded-sm bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4">
            {special.ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
