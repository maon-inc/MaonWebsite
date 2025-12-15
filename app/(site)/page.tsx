"use client";

import { useRef, useEffect } from "react";
import HeroText from "@/components/sections/home/HeroText";
import HeroDots from "@/components/sections/home/HeroDots";
import Nav from "@/components/site/Nav";
import Problem from "@/components/sections/home/Problem";
import HomeDots from "@/components/sections/home/HomeDots";
import { setScrollSource } from "@/motion/engine";

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Set custom scroll source for motion engine
    setScrollSource(() => container.scrollTop);

    return () => {
      // Reset to window scroll when unmounting
      setScrollSource(null);
    };
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Fixed background: HomeDots */}
      <div className="absolute w-full h-full z-0">
        <HomeDots />
      </div>

      {/* Two-column flex layout */}
      <div className="relative z-10 flex h-screen">
        {/* Left column: Scrollable content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto hide-scrollbar"
        >
          {/* First section: HeroText positioned at bottom-16 left-12 */}
          <section className="relative min-h-screen">
            <HeroText />
          </section>

          {/* Problem section with sticky scroll effect */}
          {/* Height of 300vh gives ~2 screens of scrolling while text stays pinned */}
          <section className="relative h-[300vh]">
            <div className="sticky top-0 h-screen flex items-center justify-center">
              <Problem />
            </div>
          </section>
        </div>

        {/* Right column: Fixed Nav (doesn't scroll) */}
        <div className="flex-shrink-0 flex items-end justify-end pr-12 pb-16 pointer-events-none">
          <div className="pointer-events-auto">
            <Nav />
          </div>
        </div>
      </div>
    </main>
  );
}
