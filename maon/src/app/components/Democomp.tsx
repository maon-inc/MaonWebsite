"use client";

import React, { useState, useEffect } from "react";

export default function DemoComp() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@")) {
      setError("Please put in a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail("");
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  return (
    <section className="pt-24 pb-0 bg-[#EBE6DF]">
      <div className="mx-auto max-w-3xl px-4 text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-libre-bodoni tracking-tight">
          <span className="italic">Join the waitlist</span>
          <span className="text-[#8B8886] ml-2">and gain access to a demo</span>
        </h1>
        <p className="mt-0 mb-15 text-base text-gray-700">
          Get the latest updates and news, as well as access to the beta.
        </p>
        <div className="flex max-w-md mx-auto mt-4 items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 border border-[#7c5a34] rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-gray-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-3 bg-[#7c5a34] border border-[#7c5a34] text-white font-semibold rounded-r-2xl hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Joining..." : "Join waitlist"}
          </button>
        </div>

        {/* Error/Success feedback (fixed height to prevent shift) */}
        <div className="relative h-6 mt-2">
          <p
            className={
              `absolute inset-0 text-sm text-red-600 transition-opacity duration-300 ` +
              (error ? "opacity-100" : "opacity-0")
            }
          >
            {error}
          </p>
          <p
            className={
              `absolute inset-0 text-sm text-green-600 transition-opacity duration-300 ` +
              (submitted ? "opacity-100" : "opacity-0")
            }
          >
            Thanks for joining!
          </p>
        </div>
      </div>

      {/* Decorative bottom image */}
      <div className="mt-12">
        <img
          src="/decoration.png"
          alt="Decorative arc"
          className="mx-auto w-full max-w-4xl object-contain"
        />
      </div>
    </section>
  );
}
