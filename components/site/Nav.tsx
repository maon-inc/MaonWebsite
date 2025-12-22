"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:hidden">
        {/* Logo - left corner */}
        <Link href="/" className="relative w-[32px] h-auto">
          <Image
            src="/assets/logo.svg"
            alt="MAON"
            width={72}
            height={69}
            className="w-full h-full"
            priority
          />
        </Link>

        {/* Hamburger button - right corner */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span
            className={`block w-6 h-[3px] rounded-full transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-[8px] bg-[#FCFCFC]" : "bg-foreground"
            }`}
          />
          <span
            className={`block w-6 h-[3px] rounded-full transition-all duration-300 ${
              isOpen ? "opacity-0 bg-[#FCFCFC]" : "bg-foreground"
            }`}
          />
          <span
            className={`block w-6 h-[3px] rounded-full transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-[8px] bg-[#FCFCFC]" : "bg-foreground"
            }`}
          />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* Mobile nav menu */}
      <nav
        className={`fixed top-0 right-0 bottom-0 z-40 md:hidden flex flex-col items-end gap-10 pt-24 pr-9 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href="/our-story"
          onClick={closeMenu}
          className="sans-400-20 text-[#FCFCFC] relative group transition-opacity hover:opacity-80"
        >
          Our Story
          <span className="absolute bottom-0 right-0 w-[29px] h-[2px] bg-[#FCFCFC] opacity-30 group-hover:opacity-60 transition-opacity" />
        </Link>
        <Link
          href="/how-it-works"
          onClick={closeMenu}
          className="sans-400-20 text-[#FCFCFC] relative group transition-opacity hover:opacity-80"
        >
          How it Works
          <span className="absolute bottom-0 right-0 w-[29px] h-[2px] bg-[#FCFCFC] opacity-30 group-hover:opacity-60 transition-opacity" />
        </Link>
        <Link
          href="/waitlist"
          onClick={closeMenu}
          className="sans-700-20 text-[#FCFCFC] relative group transition-opacity hover:opacity-80"
        >
          Save Your Spot
          <span className="absolute bottom-0 right-0 w-[130px] h-[2px] bg-[#FCFCFC]" />
        </Link>
      </nav>

      {/* Desktop nav */}
      <nav className="hidden md:flex flex-col items-end gap-12 pt-[100px] h-screen">
      {/* Logo */}
      <div className="relative w-[40px] h-auto">
        <Image
          src="/assets/logo.svg"
          alt="MAON"
          width={72}
          height={69}
          className="w-full h-full"
          priority
        />
      </div>

      {/* Links */}
      <div className="flex flex-col items-end gap-10 mt-60">
        <Link
          href="/our-story"
          className="sans-400-20 relative group transition-opacity hover:opacity-80"
        >
          Our Story
          <span className="absolute bottom-0 right-0 w-[29px] h-[2px] bg-foreground opacity-30 group-hover:opacity-60 transition-opacity" />
        </Link>
        <Link
          href="/how-it-works"
          className="sans-400-20 relative group transition-opacity hover:opacity-80"
        >
          How it Works
          <span className="absolute bottom-0 right-0 w-[29px] h-[2px] bg-foreground opacity-30 group-hover:opacity-60 transition-opacity" />
        </Link>
        <Link
          href="/waitlist"
          className="sans-700-20 relative group transition-opacity hover:opacity-80"
        >
          Save Your Spot
          <span className="absolute bottom-0 right-0 w-[130px] h-[2px] bg-foreground" />
        </Link>
      </div>

        {/* Footer text - hidden on mobile */}
      <div className="flex flex-col items-end gap-1 mt-auto">
        <div
          className="text-[20px] font-normal text-[#8C8C8C]"
          style={{
            fontFamily: "var(--font-sans-2), Arial, Helvetica, sans-serif",
          }}
        >
          MAON
        </div>
        <div className="serif-400-20 text-[#8C8C8C] text-right w-[250px]">
          A gentle redirection in a noisy world.
        </div>
      </div>
    </nav>
    </>
  );
}
