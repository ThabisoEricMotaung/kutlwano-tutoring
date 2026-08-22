import Link from "next/link";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/international-students", label: "International Students" },
  { href: "/sa-students", label: "SA Students" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <>
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-line bg-bg">
        <Link
          href="/"
          className="font-display font-bold text-2xl md:text-[26px] tracking-tight text-text"
        >
          Kutlwano <span className="text-primary">Tutoring</span>
        </Link>
        <Link
          href="/contact"
          className="font-sans font-semibold text-sm tracking-wide bg-primary text-white px-6 py-3 rounded-sm hover:bg-accent transition-colors"
        >
          Book a Lesson
        </Link>
      </header>
      <nav className="flex flex-wrap gap-5 md:gap-9 justify-center px-4 py-4 border-b border-line bg-bg">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-sans font-semibold text-[12.5px] tracking-[0.09em] uppercase text-text/75 hover:text-primary hover:opacity-100 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
