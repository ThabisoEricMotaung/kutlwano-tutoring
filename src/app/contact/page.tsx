import Link from "next/link";
import { SITE_DETAILS } from "@/lib/site-details";
export const metadata = { title: "Contact | WanoTuts" };

export default function Contact() {
  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <div className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-accent mb-4 text-center">
        Contact
      </div>
      <h1 className="font-display font-bold text-3xl md:text-[40px] leading-tight mb-6 text-center">
        Let&apos;s get you booked in.
      </h1>
      <p className="text-[17px] leading-relaxed text-text-muted mb-12 text-center max-w-xl mx-auto">
        Reach out directly, or book a lesson time that works for you.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mb-14">
        <a
          href={SITE_DETAILS.phoneHref}
          className="border border-line rounded-md p-6 text-center hover:border-primary transition-colors"
        >
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
            Phone
          </div>
          <div className="text-sm text-text">{SITE_DETAILS.phoneDisplay}</div>
        </a>
        <a
          href={`mailto:${SITE_DETAILS.email}`}
          className="border border-line rounded-md p-6 text-center hover:border-primary transition-colors"
        >
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
            Email
          </div>
          <div className="text-sm text-text">{SITE_DETAILS.email}</div>
        </a>
        <div className="border border-line rounded-md p-6 text-center">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
            Based in
          </div>
          <div className="text-sm text-text">Pretoria, South Africa</div>
        </div>
      </div>

      <div className="border border-line bg-soft rounded-md p-7 text-center text-sm text-text-muted">
        <p>
          Before sharing learner details, please read the policies that apply to
          lesson enquiries and bookings.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Link
            href="/privacy"
            className="text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-primary underline underline-offset-4"
          >
            Booking Terms
          </Link>
          <Link
            href="/child-safeguarding"
            className="text-primary underline underline-offset-4"
          >
            Child Safeguarding
          </Link>
        </div>
      </div>
    </section>
  );
}
