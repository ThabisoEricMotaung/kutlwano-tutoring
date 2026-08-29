import Image from "next/image";
import Link from "next/link";

const links = [
  ["/specials", "Specials"],
  ["/about", "About"],
  ["/international-students", "International Students"],
  ["/sa-students", "SA Students"],
  ["/pricing", "Pricing"],
  ["/contact", "Contact"],
] as const;

export default function Header() {
  return (
    <>
      <header className="flex items-center justify-between gap-4 px-5 md:px-12 py-3 border-b border-line bg-bg">
        <Link
          href="/"
          aria-label="WanoTuts home"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/Images/wanotuts-logo.svg"
            alt="WanoTuts"
            width={578}
            height={100}
            priority
            className="h-10 md:h-14 w-auto"
          />
        </Link>
        <Link
          href="/contact"
          className="font-semibold text-sm bg-primary text-white px-4 md:px-6 py-3 rounded-sm hover:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Book a Lesson
        </Link>
      </header>
      <nav
        aria-label="Main navigation"
        className="flex flex-wrap items-center gap-x-4 md:gap-x-8 gap-y-3 justify-center px-3 py-3.5 border-b border-line bg-bg"
      >
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="font-semibold text-[12px] tracking-[0.08em] uppercase text-text/75 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
