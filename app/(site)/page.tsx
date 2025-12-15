"use client";

import { useRef, useEffect } from "react";
import HeroText from "@/components/sections/home/HeroText";
import Nav from "@/components/site/Nav";
import Problem from "@/components/sections/home/Problem";
import DotsCanvas from "@/components/motion/DotsCanvas";
import DotsScene from "@/components/motion/DotsScene";
import { setScrollContainer } from "@/motion/engine";

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Set custom scroll source for motion engine
    setScrollContainer(container);

    return () => {
      // Reset to window scroll when unmounting
      setScrollContainer(null);
    };
  }, []);

  return (
    <DotsCanvas
      count={1200}
      dotRadius={1.8}
      targetWidth={500}
      targetHeight={500}
      targetAnchor="center"
      initialDurationMs={1500}
      transitionDurationMs={500}
      morphSpeed={0.7}
      colorGray="#A1A1AA"
      colorAccent="#00A452"
    >
      <main className="relative w-full h-screen overflow-hidden">
        <div className="relative z-10 flex h-screen">
          {/* Left column: Scrollable content */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto hide-scrollbar"
          >
            <DotsScene
              svgUrl="/assets/hero_svg.svg"
              className="relative min-h-screen"
              scrollStartOffset={-200}
            >
              <HeroText />
            </DotsScene>

            <DotsScene
              svgUrl="/assets/hero_svg2.svg"
              className="relative h-[200vh]"
            >
              <div className="sticky top-0 h-screen flex items-center justify-center">
                <Problem />
              </div>
            </DotsScene>
          </div>

          {/* Right column: Fixed Nav (doesn't scroll) */}
          <div className="flex-shrink-0 flex items-end justify-end pr-12 pb-16 pointer-events-none">
            <div className="pointer-events-auto">
              <Nav />
            </div>
          </div>
        </div>
      </main>
    </DotsCanvas>
  );
}
