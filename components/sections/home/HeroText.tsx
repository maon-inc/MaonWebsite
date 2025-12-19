"use client";

import { useState, useEffect } from "react";
import { subscribe } from "@/motion/engine";
import Link from "next/link";
import Image from "next/image";

export default function HeroText() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      // Hide when scrolled more than 50px
      // Only update state if the boolean value actually changes
      const shouldBeScrolled = state.scrollY > 50;
      setIsScrolled((prev) => (prev !== shouldBeScrolled ? shouldBeScrolled : prev));
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block absolute bottom-20 left-16 max-w-[600px] z-20">
      <h1 className="text-d-merriweather-48-bold mb-4 text-[var(--text-primary)]">
        AI ring to superpower your nervous system.
      </h1>
      <p className="text-d-lato-20-regular text-[var(--text-primary)]">
        Built to make you balanced without the effort.
      </p>
      <Link
        href="/waitlist"
        className="inline-flex items-center gap-2 px-5 py-2.5 w-fit text-m-lato-16-regular md:text-d-lato-20-regular !text-black mt-8"
        style={{
          border: "0.9px solid black",
          borderRadius: "11.28px",
          backgroundColor: "#D1EBF7",
          color: "black",
        }}
      >
        Join the waitlist
        <Image
          src="/assets/ui/solar_arrow-up-broken.svg"
          alt=""
          width={20}
          height={20}
          className="w-5 h-5"
        />
      </Link>
    </div>

      {/* Mobile version - appears after 2 seconds, hides on scroll */}
      <div
        className={`md:hidden absolute bottom-32 left-6 right-6 z-20 transition-opacity duration-500 flex flex-col items-center text-center ${
          isVisible && !isScrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-d-merriweather-32-regular mb-3 w-[350px] text-[var(--text-primary)]">
          AI ring to superpower your nervous system.
        </h1>
        <p className="text-d-lato-20-regular w-[300px] text-[var(--text-primary)] mb-6">
          Built to make you balanced without the effort.
        </p>
        <Link
          href="/preorder"
          className="inline-flex items-center gap-2 px-5 py-2.5 w-fit text-m-lato-16-regular md:text-d-lato-20-regular !text-black"
          style={{
            border: "0.9px solid black",
            borderRadius: "11.28px",
            backgroundColor: "#D1EBF7",
            color: "black",
          }}
        >
          Join the waitlist
          <Image
            src="/assets/ui/solar_arrow-up-broken.svg"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </Link>
      </div>
    </>
  );
}
