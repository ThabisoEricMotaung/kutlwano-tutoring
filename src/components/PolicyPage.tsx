import type { ReactNode } from "react";
import { POLICY_VERSION } from "@/lib/site-details";
export default function PolicyPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="px-6 py-16 max-w-3xl mx-auto">
      <p className="text-xs font-bold tracking-[.14em] uppercase text-accent mb-3">
        {eyebrow}
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
        {title}
      </h1>
      <p className="text-sm text-text-muted mb-10">
        Last updated: {POLICY_VERSION} · Interim working policy pending
        professional South African legal review.
      </p>
      <div className="policy-copy">{children}</div>
    </article>
  );
}
