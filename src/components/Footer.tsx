import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="font-display font-bold text-xl text-text mb-3">
            Kutlwano <span className="text-primary">Tutoring</span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            One-on-one lessons that meet you where you are — personalised
            learning, language practice, and grammar coaching.
          </p>
        </div>
        <div>
          <div className="font-sans font-semibold text-xs tracking-[0.1em] uppercase text-primary mb-4">
            Explore
          </div>
          <ul className="space-y-2 text-sm text-text-muted">
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/international-students" className="hover:text-primary">International Students</Link></li>
            <li><Link href="/sa-students" className="hover:text-primary">SA Students (Grade 8–11)</Link></li>
            <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
            <li><Link href="/specials" className="hover:text-primary">Specials</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-sans font-semibold text-xs tracking-[0.1em] uppercase text-primary mb-4">
            Contact
          </div>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>Kutlwano Sehume</li>
            <li>+27 66 162 9578</li>
            <li>sehumek@gmail.com</li>
            <li>Pretoria, South Africa</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-text-muted space-y-1">
        <div>© {new Date().getFullYear()} Kutlwano Tutoring. All rights reserved.</div>
        <div>
          Built by{" "}
          <a
            href="https://aiform-studio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary transition-colors"
          >
            AiForm Studio
          </a>
        </div>
      </div>
    </footer>
  );
}
