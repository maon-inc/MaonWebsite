"use client";

import { useIsDesktop } from "@/hooks/useIsDesktop";
import Link from "next/link";

export default function Waitlist() {
  const isDesktop = useIsDesktop();

  return (
    <div className="absolute inset-0 flex items-center justify-center">
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

      {/* Content container - positioned based on device */}
      <div
        className={`flex flex-col ${
          isDesktop
            ? "items-start absolute right-20 top-1/2 -translate-y-1/2"
            : "items-start absolute bottom-20 left-1/2 -translate-x-1/2 w-[70vw]"
        }`}
      >
        {/* Flow Ring title */}
        <h1
          className={
            isDesktop
              ? "text-d-merriweather-40-bold"
              : "text-m-merriweather-24-bold"
          }
        >
          Flow Ring
        </h1>

        {/* Description */}
        <p
          className={`opacity-50 mt-4 ${
            isDesktop
              ? "text-d-lato-24-regular max-w-[500px]"
              : "text-m-lato-14-regular"
          }`}
        >
          Smart ring that monitors your body&apos;s signals and delivers timely
          prompts to support physical and mental balance.
        </p>

        {/* Timeline */}
        <div className="mt-8">
          <p
            className={
              isDesktop ? "text-d-lato-24-italic" : "text-m-lato-14-italic"
            }
          >
            <span className="font-bold not-italic">Preorder</span> June 2026
          </p>
          <p
            className={
              isDesktop ? "text-d-lato-24-italic" : "text-m-lato-14-italic"
            }
          >
            <span className="font-bold not-italic">Launch</span> December 2026
          </p>
        </div>

        {/* Email form */}
        <div
          className={`mt-8 flex flex-col gap-4 ${
            isDesktop ? "w-[70vw] max-w-[600px]" : "w-full"
          }`}
        >
          <input
            type="email"
            placeholder="example@email.com"
            className={`w-full px-6 py-3 bg-transparent outline-none ${
              isDesktop
                ? "text-d-lato-24-bold rounded-[20px]"
                : "text-m-lato-14-bold rounded-[10px]"
            }`}
            style={{
              border: isDesktop
                ? "2px solid var(--foreground)"
                : "0.9px solid var(--foreground)",
            }}
          />
          <button
            type="button"
            className={`w-full px-6 py-3 ${
              isDesktop
                ? "text-d-lato-20-bold rounded-[20px]"
                : "text-m-lato-12-bold rounded-[10px]"
            }`}
            style={{
              backgroundColor: "#D1EBF7",
              border: isDesktop
                ? "2px solid var(--foreground)"
                : "0.9px solid var(--foreground)",
            }}
          >
            Join the Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}
