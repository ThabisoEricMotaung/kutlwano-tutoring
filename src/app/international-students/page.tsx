import Link from "next/link";

export const metadata = { title: "International Students | Kutlwano Tutoring" };

const INCLUDES = [
  "One-on-one video lessons, scheduled around your timezone",
  "Conversation practice to build real speaking confidence",
  "Grammar, spelling and writing feedback",
  "Coaching toward a specific goal — exams, work, or everyday fluency",
];

export default function InternationalStudents() {
  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <div className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-accent mb-4">
        International Students
      </div>
      <h1 className="font-display font-bold text-3xl md:text-[40px] leading-tight mb-6">
        English lessons, wherever you are.
      </h1>
      <p className="text-[17px] leading-relaxed text-text-muted mb-10">
        One-on-one English lessons for international students, focused on
        personalised learning, language practice, and grammar coaching — at a
        flat rate of{" "}
        <span className="text-text font-semibold">$25 per hour</span>.
      </p>
      <div className="bg-soft border border-line rounded-md p-7 mb-10">
        <h2 className="font-sans font-semibold text-sm tracking-wide uppercase text-primary mb-4">
          What&apos;s included
        </h2>
        <ul className="space-y-3">
          {INCLUDES.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] text-text-muted">
              <span className="text-accent mt-0.5">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href="/contact"
        className="inline-block font-semibold text-sm px-6 py-3 rounded-sm bg-primary text-white hover:bg-accent transition-colors"
      >
        Book a Lesson
      </Link>
    </section>
  );
}
