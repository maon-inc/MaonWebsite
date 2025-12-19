"use client";

import { useIsDesktop } from "@/hooks/useIsDesktop";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { getLocation } from "./getIpAddress";

export default function Waitlist() {
  const isDesktop = useIsDesktop();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);
  const waitlistCount = useQuery(api.waitlist.getWaitlistCount);

  const handleSubmit = async () => {
    if (!email || status === "loading") return;
    
    setStatus("loading");
    try {
      const location = await getLocation();
      await addToWaitlist({ 
        email, 
        country: location.country,
        region: location.region,
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

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

      {/* Fixed waitlist count */}
      {waitlistCount !== undefined && (
        <div
          className={`fixed z-40 px-4 py-2 left-1/2 -translate-x-1/2 ${
            isDesktop
              ? "text-d-lato-20-regular top-8"
              : "text-m-lato-14-regular top-14"
          }`}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "15px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
          }}
        >
          <span style={{ color: "#0B79AA" }}>
            <span style={{ fontWeight: "bold" }}>{waitlistCount}</span> people
          </span>{" "}
          <span style={{ color: "#000000" }}> signed up</span>
        </div>
      )}

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
              : "text-m-lato-16-regular"
          }`}
        >
          Smart ring that monitors your body&apos;s signals and delivers timely
          prompts to support physical and mental balance.
        </p>

        {/* Timeline */}
        <div className="mt-4 md:mt-8">
          <p
            className={
              isDesktop ? "text-d-lato-24-italic" : "text-m-lato-16-italic"
            }
          >
            <span className="font-bold not-italic">Preorder</span> June 2026
          </p>
          <p
            className={
              isDesktop ? "text-d-lato-24-italic" : "text-m-lato-16-italic"
            }
          >
            <span className="font-bold not-italic">Launch</span> December 2026
          </p>
        </div>

        {/* Email form */}
        <div
          className={`mt-6 md:mt-8 flex flex-col gap-4 ${
            isDesktop ? "w-[70vw] max-w-[600px]" : "w-full"
          }`}
        >
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className={`w-full md:w-[80%] px-6 py-3 bg-transparent outline-none ${
              isDesktop
                ? "text-d-lato-20-bold rounded-[20px]"
                : "text-m-lato-14-bold rounded-[10px]"
            } ${status === "loading" ? "opacity-50" : ""}`}
            style={{
              border: isDesktop
                ? "2px solid var(--foreground)"
                : "0.9px solid var(--foreground)",
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading" || status === "success"}
            className={`w-full md:w-[80%] px-6 py-3 ${
              isDesktop
                ? "text-d-lato-20-bold rounded-[20px]"
                : "text-m-lato-12-bold rounded-[10px]"
            } ${status === "loading" ? "opacity-50" : ""}`}
            style={{
              backgroundColor: status === "success" ? "#A8E6CF" : "#D1EBF7",
              border: isDesktop
                ? "2px solid var(--foreground)"
                : "0.9px solid var(--foreground)",
            }}
          >
            {status === "loading" 
              ? "Joining..." 
              : status === "success" 
              ? "You're on the list!" 
              : "Join the Waitlist"}
          </button>
          {status === "error" && (
            <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
