"use client";

import { useRef, useEffect, useState } from "react";
import HeroText from "@/components/sections/home/HeroText";
import Nav from "@/components/site/Nav";
import Problem from "@/components/sections/home/Problem";
import DotsCanvas from "@/components/motion/DotsCanvas";
import DotsScene from "@/components/motion/DotsScene";
import { setScrollContainer } from "@/motion/engine";

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const targetSize = isMobile ? 320 : 500;

  return (
    <DotsCanvas
      count={1200}
      dotRadius={1.8}
      targetWidth={targetSize}
      targetHeight={targetSize}
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

            <section className="relative h-[250vh]">
              {/* Scroll measurement regions based on scrollable range (250vh - 100vh viewport = 150vh) */}
              <div className="absolute inset-0">
                <DotsScene scatter className="h-[100vh]" />
                <DotsScene dissipate className="h-[50vh]" />
              </div>

              {/* Visible sticky content */}
              <div className="sticky top-0 h-screen flex items-center justify-center">
                <Problem />
              </div>
            </section>
          </div>

          {/* Right column: Fixed Nav (doesn't scroll) - hidden on mobile */}
          <div className="hidden md:flex flex-shrink-0 items-end justify-end pr-12 pb-16 pointer-events-none">
            <div className="pointer-events-auto">
              <Nav />
            </div>
          </div>

          {/* Mobile Nav (renders its own fixed header) */}
          <div className="md:hidden">
            <Nav />
          </div>
        </div>
      </main>
    </DotsCanvas>
  );
}
