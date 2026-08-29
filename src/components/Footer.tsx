import Image from "next/image";
import Link from "next/link";
import { SITE_DETAILS } from "@/lib/site-details";
export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <Image
            src="/Images/wanotuts-logo.svg"
            alt="WanoTuts"
            width={578}
            height={100}
            className="h-12 md:h-14 w-auto mb-3"
          />
          <p className="text-sm text-text-muted leading-relaxed">
            One-on-one lessons that meet you where you are — personalised
            learning, language practice, and grammar coaching.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-xs tracking-[0.1em] uppercase text-primary mb-4">
            Explore
          </h2>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/international-students">International Students</Link>
            </li>
            <li>
              <Link href="/sa-students">SA Students (Grade 8–11)</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/specials">Specials</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Booking Terms</Link>
            </li>
            <li>
              <Link href="/child-safeguarding">Child Safeguarding</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-xs tracking-[0.1em] uppercase text-primary mb-4">
            Contact
          </h2>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>{SITE_DETAILS.operator}</li>
            <li>
              <a href={SITE_DETAILS.phoneHref}>{SITE_DETAILS.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${SITE_DETAILS.email}`}>{SITE_DETAILS.email}</a>
            </li>
            <li>Pretoria, South Africa</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-text-muted space-y-1">
        <div>
          © {new Date().getFullYear()} WanoTuts (Kutlwano Tutoring). All rights
          reserved.
        </div>
        <div>
          Built by{" "}
          <a
            href="https://aiform-studio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary"
          >
            AiForm Studio
          </a>
        </div>
      </div>
    </footer>
  );
}
