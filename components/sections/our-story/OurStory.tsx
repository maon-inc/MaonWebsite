"use client";

import { useIsDesktop } from "@/hooks/useIsDesktop";
import Link from "next/link";

export default function OurStory() {
  const isDesktop = useIsDesktop();

  return (
    <div className="min-h-screen flex items-center px-6 md:px-20 py-20">
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
        className={`flex flex-col items-start max-w-[600px] ml-4 md:ml-12 ${
          isDesktop ? "" : "w-[85vw]"
        }`}
      >
        {/* Our Story title */}
        <h1
          className={
            isDesktop
              ? "serif-700-40"
              : "serif-700-24"
          }
        >
          Our Story
        </h1>

        {/* Subheading */}
        <p
          className={`opacity-70 mt-4 ${
            isDesktop
              ? "sans-400-24"
              : "sans-400-14"
          }`}
        >
          Maon Intelligence is an AI wearable company founded in 2025
        </p>

        {/* Body paragraph 1 */}
        <p
          className={`opacity-70 mt-4 ${
            isDesktop
              ? "sans-400-24"
              : "sans-400-14"
          }`}
        >
          We began in a lab at Cornell University where we found a bunch of cool stuff
          about haptic patterns on people&apos;s decision-making and emotions, leading to
          us co authoring a paper.
        </p>

        {/* Body paragraph 2 */}
        <p
          className={`opacity-70 mt-4 ${
            isDesktop
              ? "sans-400-24"
              : "sans-400-14"
          }`}
        >
          We aim to help people achieve better balance and make more deliberate
          choices through AI wearables that listen to the body, not words.
        </p>

        {/* Fundraising section */}
        <div className="mt-8 md:mt-12">
          <p
            className={`opacity-70 ${
              isDesktop
                ? "sans-400-24"
                : "sans-400-14"
            }`}
          >
            If you are interested in joining us as an investor.
          </p>
        </div>

        {/* Contact Us button */}
        <div className="mt-4 md:mt-6">
          <a
            href="mailto:contact@maon.io"
            className={`inline-block px-12 py-3 text-center ${
              isDesktop
                ? "sans-700-20 rounded-[20px]"
                : "sans-700-12 rounded-[10px]"
            }`}
            style={{
              backgroundColor: "#D1EBF7",
              border: isDesktop
                ? "2px solid var(--foreground)"
                : "0.9px solid var(--foreground)",
            }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

