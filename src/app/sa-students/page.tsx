import Link from "next/link";

export const metadata = { title: "SA Students Grade 8–11 | Kutlwano Tutoring" };

const SUBJECTS = [
  "English",
  "Afrikaans",
  "Mathematics",
  "Technical Mathematics",
  "Technical Science",
  "Natural Science",
  "Physical Sciences",
];

export default function SAStudents() {
  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <div className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-accent mb-4">
        South African Students · Grade 8–11
      </div>
      <h1 className="font-display font-bold text-3xl md:text-[40px] leading-tight mb-6">
        One-on-one lessons for Grade 8–11.
      </h1>
      <p className="text-[17px] leading-relaxed text-text-muted mb-10">
        Personalised tutoring for South African learners in Grade 8–11, at{" "}
        <span className="text-text font-semibold">R500 per subject, per month</span>.
      </p>
      <div className="bg-soft border border-line rounded-md p-7 mb-10">
        <h2 className="font-sans font-semibold text-sm tracking-wide uppercase text-primary mb-4">
          Subjects offered
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {SUBJECTS.map((s) => (
            <div key={s} className="flex gap-3 text-[15px] text-text-muted">
              <span className="text-accent">—</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
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
