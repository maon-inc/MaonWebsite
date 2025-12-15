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
      setIsScrolled(state.scrollY > 50);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block absolute bottom-20 left-16 max-w-[600px] z-20">
        <h1 className="text-d-merriweather-48-bold mb-4 text-[#171717]">
          AI ring to superpower your nervous system.
        </h1>
        <p className="text-d-lato-20-regular text-[#171717]">
          Built to make you balanced without the effort.
        </p>
      </div>

      {/* Mobile version - appears after 2 seconds, hides on scroll */}
      <div
        className={`md:hidden absolute bottom-32 left-12 right-12 z-20 transition-opacity duration-500 ${
          isVisible && !isScrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-d-merriweather-24-bold mb-3 text-[#171717]">
          AI ring to superpower your nervous system.
        </h1>
        <p className="text-d-lato-20-regular text-[#171717] mb-6">
          Built to make you balanced without the effort.
        </p>
        <Link
          href="/preorder"
          className="inline-flex items-center justify-center gap-2 w-[208px] text-d-lato-20-regular text-[#171717] border border-[#171717] rounded-[9.03px] py-3 transition-opacity hover:opacity-70"
          style={{ borderWidth: "0.9px" }}
        >
          Join the waitlist
          <Image
            src="/assets/ui/solar_arrow-up-broken.svg"
            alt=""
            width={25}
            height={25}
          />
        </Link>
      </div>
    </>
  );
}
