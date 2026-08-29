import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { SITE_DETAILS } from "@/lib/site-details";
export const metadata: Metadata = {
  title: "Booking and Tutoring Terms | WanoTuts",
  description:
    "Plain-language WanoTuts booking, payment, scheduling and tutoring terms.",
};
export default function Terms() {
  return (
    <PolicyPage eyebrow="Bookings" title="Booking and Tutoring Terms">
      <h2>December Learning Boost</h2>
      <p>
        The package contains four live, 60-minute one-on-one Microsoft Teams
        lessons, a personal learning plan and a short progress summary after the
        final lesson. International pricing is USD 90. South African pricing is
        ZAR 450 per subject. Payment must be verified before a purchase is
        confirmed.
      </p>
      <h2>Validity and scheduling</h2>
      <p>
        Lessons must be used from 1–31 December 2026 and depend on the tutor’s
        available booking times. Purchase does not guarantee every requested
        time. The package does not renew automatically.
      </p>
      <h2>Rescheduling, cancellations and missed lessons</h2>
      <p>
        Ask to reschedule as early as reasonably possible. Changes depend on
        availability. A missed lesson or late cancellation may count as used
        where the reserved time cannot reasonably be reassigned. If the tutor
        cancels, the lesson will be rescheduled and will not expire merely
        because the cancellation made use by 31 December impracticable.
      </p>
      <h2>Expiry and refunds</h2>
      <p>
        Unused lessons expire after 31 December 2026 unless the tutor cancelled
        a lesson. Refund requests are considered fairly according to the
        circumstances, services already delivered, applicable consumer law and
        unavoidable costs. Contact WanoTuts promptly rather than initiating
        duplicate bookings.
      </p>
      <h2>Technical problems</h2>
      <p>
        Both parties should use a suitable device, connection and quiet
        environment. If a material technical problem prevents a lesson, the
        parties will reasonably try to reconnect or arrange another time,
        considering who controlled the problem.
      </p>
      <h2>Conduct and minors</h2>
      <p>
        Participants must communicate respectfully and use approved lesson
        channels. A parent or guardian must authorise bookings for minors,
        provide accurate contact details and support an appropriate learning
        environment. Microsoft Teams lessons are not recorded by default.
      </p>
      <h2>Questions and complaints</h2>
      <p>
        Contact {SITE_DETAILS.operator} at{" "}
        <a href={`mailto:${SITE_DETAILS.email}`}>{SITE_DETAILS.email}</a> or{" "}
        <a href={SITE_DETAILS.phoneHref}>{SITE_DETAILS.phoneDisplay}</a>.
        WanoTuts will try to address concerns promptly and fairly.
      </p>
    </PolicyPage>
  );
}
