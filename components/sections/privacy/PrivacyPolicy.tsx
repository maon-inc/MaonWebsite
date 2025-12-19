"use client";

import { useIsDesktop } from "@/hooks/useIsDesktop";
import Link from "next/link";

export default function PrivacyPolicy() {
  const isDesktop = useIsDesktop();

  const headerClass = isDesktop
    ? "text-d-merriweather-40-bold"
    : "text-m-merriweather-24-bold";

  const sectionHeaderClass = isDesktop
    ? "text-d-lato-24-bold mt-8"
    : "text-m-lato-14-bold mt-6";

  const subHeaderClass = isDesktop
    ? "text-d-lato-24-bold mt-4"
    : "text-m-lato-14-bold mt-3";

  const bodyClass = isDesktop
    ? "text-d-lato-24-regular mt-4"
    : "text-m-lato-14-regular mt-3";

  const listClass = isDesktop
    ? "text-d-lato-24-regular mt-2 ml-6"
    : "text-m-lato-14-regular mt-2 ml-4";

  return (
    <div className="min-h-screen px-6 md:px-20 py-20">
      {/* Back button */}
      <Link
        href="/"
        className="fixed top-6 left-6 md:top-8 md:left-8 z-50 transition-opacity hover:opacity-70"
        aria-label="Go back"
      >
        <img
          src="/assets/ui/back_button.svg"
          alt=""
          className="w-4 h-4 md:w-6 md:h-6"
        />
      </Link>

      {/* Content container */}
      <div
        className={`flex flex-col items-start max-w-[800px] ml-4 md:ml-12 ${
          isDesktop ? "" : "w-[85vw]"
        }`}
      >
        {/* Header */}
        <h1 className={headerClass}>Privacy Policy</h1>

        <p className={bodyClass}>Effective Date: December 19, 2025</p>

        <p className={bodyClass}>
          Maon Intelligence Inc. (&quot;Maon,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your
          privacy and is committed to protecting it through this Privacy Policy. This
          policy describes how we collect, use, and share information when you access
          or use our website, products, and services (collectively, the &quot;Services&quot;).
        </p>

        <p className={bodyClass}>
          By using the Services, you agree to the collection and use of information
          in accordance with this Privacy Policy.
        </p>

        {/* Section 1 */}
        <h2 className={sectionHeaderClass}>1. Scope and Pre-Launch Notice</h2>
        <p className={bodyClass}>
          Maon is currently operating in a pre-launch and experimental phase. Our data
          practices may evolve as our products develop. Some features described in this
          policy may not yet be active, and others may change prior to public release.
        </p>

        {/* Section 2 */}
        <h2 className={sectionHeaderClass}>2. Information We Collect</h2>

        <h3 className={subHeaderClass}>a. Information You Provide Voluntarily</h3>
        <p className={bodyClass}>
          We may collect information you provide directly to us, including:
        </p>
        <ul className={listClass}>
          <li>Name</li>
          <li>Email address</li>
          <li>Contact details</li>
          <li>Waitlist or early access registration information</li>
          <li>Feedback, survey responses, or communications with us</li>
        </ul>
        <p className={bodyClass}>
          You are not required to provide information beyond what is necessary to access
          certain features, but some functionality may be unavailable without it.
        </p>

        <h3 className={subHeaderClass}>b. Automatically Collected Information</h3>
        <p className={bodyClass}>
          When you use our Services, we may automatically collect limited technical
          information, such as:
        </p>
        <ul className={listClass}>
          <li>Device type and browser information</li>
          <li>IP address</li>
          <li>Approximate location derived from IP</li>
          <li>Usage data related to page views and interactions</li>
        </ul>
        <p className={bodyClass}>
          This information is used primarily for analytics, security, and service improvement.
        </p>

        <h3 className={subHeaderClass}>c. Future Sensor or Signal Data</h3>
        <p className={bodyClass}>
          As Maon develops hardware and software products, future versions of the Services
          may involve biometric, physiological, or behavioral signals.
        </p>
        <p className={bodyClass}>
          During pre-launch, such data is either not collected or collected only with
          explicit user consent and clear disclosure. Any expanded data collection will
          be governed by updated versions of this Privacy Policy.
        </p>

        {/* Section 3 */}
        <h2 className={sectionHeaderClass}>3. How We Use Information</h2>
        <p className={bodyClass}>We may use the information we collect to:</p>
        <ul className={listClass}>
          <li>Operate, maintain, and improve the Services</li>
          <li>Communicate with you about updates, access, or changes</li>
          <li>Manage waitlists, beta programs, or early access</li>
          <li>Analyze usage patterns and improve user experience</li>
          <li>Ensure security and prevent misuse</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p className={bodyClass}>We do not sell your personal information.</p>

        {/* Section 4 */}
        <h2 className={sectionHeaderClass}>4. How We Share Information</h2>
        <p className={bodyClass}>
          We may share information only in the following circumstances:
        </p>
        <ul className={listClass}>
          <li>
            With service providers who assist us in operating the Services, such as
            hosting, analytics, or email delivery
          </li>
          <li>If required by law, regulation, or legal process</li>
          <li>To protect the rights, safety, or property of Maon or others</li>
          <li>
            In connection with a corporate transaction such as a merger, acquisition,
            or asset sale
          </li>
        </ul>
        <p className={bodyClass}>
          All service providers are required to use information only as necessary to
          perform services on our behalf.
        </p>

        {/* Section 5 */}
        <h2 className={sectionHeaderClass}>5. Data Retention</h2>
        <p className={bodyClass}>
          We retain personal information only for as long as necessary to fulfill the
          purposes described in this policy, unless a longer retention period is required
          or permitted by law.
        </p>
        <p className={bodyClass}>
          Pre-launch data may be deleted, anonymized, or aggregated as products evolve.
        </p>

        {/* Section 6 */}
        <h2 className={sectionHeaderClass}>6. Data Security</h2>
        <p className={bodyClass}>
          We take reasonable administrative, technical, and organizational measures to
          protect your information. However, no system is completely secure, and we
          cannot guarantee absolute security of your data.
        </p>

        {/* Section 7 */}
        <h2 className={sectionHeaderClass}>7. Your Rights and Choices</h2>
        <p className={bodyClass}>
          Depending on your location, you may have rights to:
        </p>
        <ul className={listClass}>
          <li>Access the personal information we hold about you</li>
          <li>Request correction or deletion of your information</li>
          <li>Withdraw consent where applicable</li>
        </ul>
        <p className={bodyClass}>
          You can make requests by contacting us using the information below. We may
          need to verify your identity before responding.
        </p>

        {/* Section 8 */}
        <h2 className={sectionHeaderClass}>8. Children&apos;s Privacy</h2>
        <p className={bodyClass}>
          The Services are not intended for individuals under the age of 18. We do not
          knowingly collect personal information from children. If we learn that such
          information has been collected, we will take steps to delete it.
        </p>

        {/* Section 9 */}
        <h2 className={sectionHeaderClass}>9. International Users</h2>
        <p className={bodyClass}>
          If you access the Services from outside the United States, your information
          may be transferred to and processed in the United States, where data protection
          laws may differ from those in your jurisdiction.
        </p>

        {/* Section 10 */}
        <h2 className={sectionHeaderClass}>10. Changes to This Privacy Policy</h2>
        <p className={bodyClass}>
          We may update this Privacy Policy from time to time. If we make material
          changes, we will update the effective date and may notify you through the
          Services. Continued use of the Services after changes take effect constitutes
          acceptance of the revised policy.
        </p>

        {/* Section 11 */}
        <h2 className={sectionHeaderClass}>11. Contact Us</h2>
        <p className={bodyClass}>
          If you have questions or concerns about this Privacy Policy or our data
          practices, please contact us at:
        </p>
        <p className={bodyClass}>
          Maon Intelligence Inc.
          <br />
          maonhealth@gmail.com
        </p>
      </div>
    </div>
  );
}
