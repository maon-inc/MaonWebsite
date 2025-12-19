"use client";

import { useIsDesktop } from "@/hooks/useIsDesktop";
import Link from "next/link";

export default function TermsOfService() {
  const isDesktop = useIsDesktop();

  const headerClass = isDesktop
    ? "text-d-merriweather-40-bold"
    : "text-m-merriweather-24-bold";

  const sectionHeaderClass = isDesktop
    ? "text-d-lato-24-bold mt-8"
    : "text-m-lato-14-bold mt-6";

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
        <h1 className={headerClass}>Terms of Service</h1>

        <p className={bodyClass}>Effective Date: December 19, 2025</p>

        <p className={bodyClass}>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
          website, products, applications, and services (collectively, the
          &quot;Services&quot;) provided by Maon Intelligence Inc., a Delaware corporation
          (&quot;Maon,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
        </p>

        <p className={bodyClass}>
          By accessing or using our Services, you agree to be bound by these Terms.
          If you do not agree, you may not access or use the Services.
        </p>

        {/* Section 1 */}
        <h2 className={sectionHeaderClass}>1. About Maon and Pre-Launch Status</h2>
        <p className={bodyClass}>
          Maon is developing technology intended to support balance, well-being, and
          related user experiences through signal-based prompts and interactions.
        </p>
        <p className={bodyClass}>
          The Services are currently offered on a pre-launch, experimental, and
          informational basis. Certain features may be incomplete, inaccurate,
          unavailable, or subject to change at any time without notice. We do not
          guarantee that any functionality will be released, maintained, or perform
          as expected.
        </p>

        {/* Section 2 */}
        <h2 className={sectionHeaderClass}>2. Eligibility</h2>
        <p className={bodyClass}>
          You must be at least 18 years old to use the Services. By using the
          Services, you represent that you meet this requirement and have the legal
          capacity to enter into these Terms.
        </p>

        {/* Section 3 */}
        <h2 className={sectionHeaderClass}>3. No Medical or Professional Advice</h2>
        <p className={bodyClass}>
          Maon does not provide medical, health, diagnostic, or therapeutic advice.
        </p>
        <p className={bodyClass}>
          The Services are not intended to diagnose, treat, cure, or prevent any
          disease or medical condition, nor to replace professional medical advice.
          Any information or feedback provided through the Services is for general
          informational and experiential purposes only.
        </p>
        <p className={bodyClass}>
          You should always seek the advice of a qualified professional before making
          health or lifestyle decisions. Your use of the Services is at your own risk.
        </p>

        {/* Section 4 */}
        <h2 className={sectionHeaderClass}>4. User Accounts and Information</h2>
        <p className={bodyClass}>
          You may be required to provide certain information to access parts of the
          Services, including during waitlist registration or early access programs.
        </p>
        <p className={bodyClass}>
          You agree to provide accurate information and to keep it up to date. You are
          responsible for maintaining the confidentiality of any credentials associated
          with your account and for all activities that occur under your account.
        </p>

        {/* Section 5 */}
        <h2 className={sectionHeaderClass}>5. Acceptable Use</h2>
        <p className={bodyClass}>You agree not to:</p>
        <ul className={listClass}>
          <li>Use the Services for any unlawful purpose</li>
          <li>Interfere with or disrupt the operation or security of the Services</li>
          <li>Attempt to reverse engineer, copy, scrape, or misuse any part of the Services</li>
          <li>Use the Services in a way that could harm Maon or other users</li>
        </ul>
        <p className={bodyClass}>
          We reserve the right to suspend or terminate access if we believe you have
          violated these Terms.
        </p>

        {/* Section 6 */}
        <h2 className={sectionHeaderClass}>6. Intellectual Property</h2>
        <p className={bodyClass}>
          All content, software, designs, trademarks, logos, and other materials
          provided by Maon are owned by or licensed to Maon and are protected by
          intellectual property laws.
        </p>
        <p className={bodyClass}>
          You are granted a limited, non-exclusive, non-transferable, revocable license
          to use the Services solely for personal, non-commercial purposes during the
          pre-launch period.
        </p>
        <p className={bodyClass}>
          Nothing in these Terms transfers ownership of any intellectual property to you.
        </p>

        {/* Section 7 */}
        <h2 className={sectionHeaderClass}>7. Feedback</h2>
        <p className={bodyClass}>
          If you provide suggestions, feedback, or ideas regarding the Services, you
          agree that Maon may use them without restriction or compensation, including
          for product development and commercialization.
        </p>

        {/* Section 8 */}
        <h2 className={sectionHeaderClass}>8. Privacy</h2>
        <p className={bodyClass}>
          Your use of the Services is also governed by our Privacy Policy, which
          describes how we collect, use, and protect your information. By using the
          Services, you consent to those practices.
        </p>

        {/* Section 9 */}
        <h2 className={sectionHeaderClass}>9. Disclaimer of Warranties</h2>
        <p className={bodyClass}>
          The Services are provided &quot;as is&quot; and &quot;as available.&quot;
        </p>
        <p className={bodyClass}>
          To the maximum extent permitted by law, Maon disclaims all warranties,
          express or implied, including warranties of merchantability, fitness for a
          particular purpose, accuracy, and non-infringement.
        </p>
        <p className={bodyClass}>
          We do not warrant that the Services will be uninterrupted, error-free,
          secure, or reliable.
        </p>

        {/* Section 10 */}
        <h2 className={sectionHeaderClass}>10. Limitation of Liability</h2>
        <p className={bodyClass}>
          To the maximum extent permitted by law, Maon shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, including
          loss of data, profits, or goodwill, arising out of or related to your use of
          the Services.
        </p>
        <p className={bodyClass}>
          In no event shall Maon&apos;s total liability exceed one hundred U.S. dollars ($100).
        </p>

        {/* Section 11 */}
        <h2 className={sectionHeaderClass}>11. Indemnification</h2>
        <p className={bodyClass}>
          You agree to indemnify and hold harmless Maon, its officers, directors,
          employees, and affiliates from any claims, liabilities, damages, or expenses
          arising from your use of the Services or violation of these Terms.
        </p>

        {/* Section 12 */}
        <h2 className={sectionHeaderClass}>12. Termination</h2>
        <p className={bodyClass}>
          We may suspend or terminate your access to the Services at any time, with or
          without notice, for any reason, including if we discontinue the Services or
          pre-launch program.
        </p>
        <p className={bodyClass}>
          Sections that by their nature should survive termination shall survive,
          including intellectual property, disclaimers, limitation of liability, and
          governing law.
        </p>

        {/* Section 13 */}
        <h2 className={sectionHeaderClass}>13. Governing Law</h2>
        <p className={bodyClass}>
          These Terms are governed by the laws of the State of Delaware, without regard
          to conflict of law principles.
        </p>
        <p className={bodyClass}>
          Any disputes arising under these Terms shall be resolved exclusively in the
          state or federal courts located in Delaware.
        </p>

        {/* Section 14 */}
        <h2 className={sectionHeaderClass}>14. Changes to These Terms</h2>
        <p className={bodyClass}>
          We may update these Terms from time to time. If we make material changes, we
          will update the effective date. Continued use of the Services after changes
          become effective constitutes acceptance of the revised Terms.
        </p>

        {/* Section 15 */}
        <h2 className={sectionHeaderClass}>15. Contact</h2>
        <p className={bodyClass}>
          If you have questions about these Terms, please contact us at:
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
