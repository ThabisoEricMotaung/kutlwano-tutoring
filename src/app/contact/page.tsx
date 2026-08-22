export const metadata = { title: "Contact | Kutlwano Tutoring" };

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
          href="tel:+27661629578"
          className="border border-line rounded-md p-6 text-center hover:border-primary transition-colors"
        >
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
            Phone
          </div>
          <div className="text-sm text-text">+27 66 162 9578</div>
        </a>
        <a
          href="mailto:sehumek@gmail.com"
          className="border border-line rounded-md p-6 text-center hover:border-primary transition-colors"
        >
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
            Email
          </div>
          <div className="text-sm text-text">sehumek@gmail.com</div>
        </a>
        <div className="border border-line rounded-md p-6 text-center">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-accent mb-2">
            Based in
          </div>
          <div className="text-sm text-text">Pretoria, South Africa</div>
        </div>
      </div>

      {/* Booking embed placeholder */}
      <div className="border border-dashed border-line rounded-md p-10 text-center text-sm text-text-muted">
        Booking calendar embed goes here (e.g. Calendly).
      </div>
    </section>
  );
}
