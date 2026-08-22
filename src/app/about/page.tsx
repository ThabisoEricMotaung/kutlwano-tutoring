export const metadata = { title: "About | Kutlwano Tutoring" };

export default function About() {
  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <div className="text-[12.5px] font-semibold tracking-[0.14em] uppercase text-accent mb-4">
        About
      </div>
      <h1 className="font-display font-bold text-3xl md:text-[40px] leading-tight mb-8">
        Hi, I&apos;m Kutlwano Sehume.
      </h1>
      <div className="space-y-5 text-[17px] leading-relaxed text-text-muted">
        <p>
          I offer one-on-one lessons built around the way each student
          actually learns — not a one-size-fits-all curriculum. Whether
          you&apos;re an international student working on English fluency,
          or a Grade 8–11 learner in South Africa preparing for exams, every
          session is personalised to where you are and where you want to go.
        </p>
        <p>
          My approach combines personalised learning, real language
          practice, careful grammar and spellcheck feedback, and ongoing
          coaching — so progress is steady, not rushed.
        </p>
        <p>
          I&apos;m based in Pretoria, South Africa, and work with students
          both locally and internationally.
        </p>
      </div>
    </section>
  );
}
