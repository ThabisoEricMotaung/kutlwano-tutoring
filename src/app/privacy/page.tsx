import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { SITE_DETAILS } from "@/lib/site-details";
export const metadata: Metadata = {
  title: "Privacy Policy | WanoTuts",
  description:
    "How WanoTuts collects, uses and protects learner, guardian and customer information.",
};
export default function Privacy() {
  return (
    <PolicyPage eyebrow="Privacy" title="Privacy Policy">
      <h2>WanoTuts and Kopanong Ya Kutlwano Enterprise</h2>
      <p>
        WanoTuts is a tutoring service operated by Kopanong Ya Kutlwano Enterprise. Kopanong Ya Kutlwano Enterprise is the controller of your personal information and is responsible for your booking, payment and learner data.
      </p>
      <h2>Who operates WanoTuts</h2>
      <p>
        {SITE_DETAILS.legalDescription} For privacy questions, requests or
        complaints, email{" "}
        <a href={`mailto:${SITE_DETAILS.privacyEmail}`}>
          {SITE_DETAILS.privacyEmail}
        </a>{" "}
        or call <a href={SITE_DETAILS.phoneHref}>{SITE_DETAILS.phoneDisplay}</a>
        .
      </p>
      <h2>Information we collect and why</h2>
      <ul>
        <li>
          Contact details for lesson administration, payment, scheduling,
          service messages and support.
        </li>
        <li>
          For minors: guardian name, email and telephone; learner first name,
          grade, subject, country, time zone, general learning goal and
          preferred times.
        </li>
        <li>
          Package, price, consent versions, timestamps, purchase reference and
          payment status to perform the booking, keep accurate records and
          resolve disputes.
        </li>
        <li>
          Optional marketing choice, stored separately, to send requested news
          or offers. Purchase does not depend on this choice.
        </li>
      </ul>
      <p>
        Processing is used to take steps requested before a booking, perform
        tutoring and payment arrangements, meet legal and record-keeping duties,
        protect the service, and pursue legitimate operational interests without
        overriding individual rights. Consent is used where specifically
        requested, including guardian authorisation and optional marketing.
      </p>
      <h2>Learners under 18</h2>
      <p>
        A booking for a minor must be completed or authorised by a parent or
        legally authorised guardian. WanoTuts limits minor data to the fields
        listed above and does not request identity numbers, passports, exact
        birth dates, addresses, medical histories, payment credentials or full
        school records through this form.
      </p>
      <h2>Service providers and international processing</h2>
      <p>
        PayFast processes payment and payer information; Calendly processes
        scheduling details; Microsoft Teams processes online lesson
        communications; hosting and database providers process application and
        purchase records; and an email provider may process service messages if
        configured. These providers may process information outside South Africa
        under their own infrastructure and safeguards. WanoTuts does not receive
        or store full payment-card or banking credentials.
      </p>
      <h2>Security, access and retention</h2>
      <p>
        Access to learner records is restricted through database and hosting
        credentials. Transport encryption, server-side validation, verified
        payment notifications and limited logging are used. No security method
        is infallible. Purchase and consent records are kept only for
        operational, dispute, tax and legal needs, then deleted or de-identified
        when no longer reasonably required. A fixed retention period has not yet
        been configured.
      </p>
      <h2>Your choices and rights</h2>
      <p>
        You may request access, correction or deletion, object to certain
        processing, or withdraw consent where consent is the basis. Marketing
        can be withdrawn by emailing the privacy contact. Withdrawal does not
        affect earlier lawful processing and may not require deletion where
        records must be retained by law.
      </p>
      <h2>Complaints and security compromises</h2>
      <p>
        Submit privacy complaints to the contact above. You may also approach
        South Africa’s Information Regulator. If personal information is
        compromised, WanoTuts will investigate, mitigate the issue, notify the
        Information Regulator and contact affected people in writing as soon as
        reasonably possible where required, using available contact details and
        sufficient practical information.
      </p>
      <h2>Lesson recording</h2>
      <p>
        Microsoft Teams lessons are not recorded by default. Any future
        recording would require separate, specific parent or guardian consent
        and would not be authorised by ordinary booking consent.
      </p>
    </PolicyPage>
  );
}
