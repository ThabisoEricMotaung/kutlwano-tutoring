import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { SITE_DETAILS } from "@/lib/site-details";
export const metadata: Metadata = {
  title: "Child Safeguarding and Online Lesson Policy | WanoTuts",
  description:
    "WanoTuts boundaries and reporting arrangements for safer online lessons involving minors.",
};
export default function Safeguarding() {
  return (
    <PolicyPage
      eyebrow="Learner protection"
      title="Child Safeguarding and Online Lesson Policy"
    >
      <h2>Guardian responsibility</h2>
      <p>
        A parent or legally authorised guardian must make or authorise a minor’s
        booking and provide their own contact details. Younger learners should
        attend in an appropriate shared or supervised environment where
        practical.
      </p>
      <h2>Communication boundaries</h2>
      <p>
        Tutor–learner communication must remain appropriate, lesson-related and
        professional. Scheduling, lesson links and service messages should use
        the approved email, telephone, Calendly and Microsoft Teams channels.
        WanoTuts does not use private social-media contact with minors.
      </p>
      <h2>Online conduct</h2>
      <p>
        The tutor and learner should dress and behave appropriately, avoid
        sharing unnecessary personal information, and use a suitable learning
        space. Harassment, sexualised conduct, intimidation, discrimination and
        abusive language are not acceptable.
      </p>
      <h2>Recording</h2>
      <p>
        Lessons are not recorded by default. Recording will not be enabled
        merely because a booking was accepted. Any future recording requires
        separate, specific parent or guardian consent and clear information
        about purpose, access and retention.
      </p>
      <h2>Reporting and escalation</h2>
      <p>
        Report a safeguarding concern to {SITE_DETAILS.operator} at{" "}
        <a href={`mailto:${SITE_DETAILS.email}`}>{SITE_DETAILS.email}</a> or{" "}
        <a href={SITE_DETAILS.phoneHref}>{SITE_DETAILS.phoneDisplay}</a>.
        WanoTuts will preserve relevant information, stop or restrict concerning
        contact where appropriate, communicate with the guardian, and escalate
        credible risks to appropriate emergency, child-protection or
        law-enforcement services when reasonably necessary.
      </p>
      <p>
        This interim policy does not claim external safeguarding certification,
        vetting procedures or designated safeguarding staff.
      </p>
    </PolicyPage>
  );
}
