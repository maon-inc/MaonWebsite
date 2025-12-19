"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import HeroText from "@/components/sections/home/HeroText";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import Problem from "@/components/sections/home/Problem";
import Intro from "@/components/sections/home/Intro";
import Day from "@/components/sections/home/Day";
import DayAutoEffort from "@/components/sections/home/DayAutoEffort";
import SaveSpot from "@/components/sections/home/SaveSpot";
import DotsCanvas from "@/components/motion/DotsCanvas";
import DotsScene from "@/components/motion/DotsScene";
import { setScrollContainer, subscribe, getScrollContainer } from "@/motion/engine";
import { measureElement } from "@/motion/measures";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const daySectionRef = useRef<HTMLDivElement>(null);
  const [shouldHideNav, setShouldHideNav] = useState(false);
  
  const isDesktop = useIsDesktop();
  const isMobile = !isDesktop;
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  
  const setScrollEl = useCallback((node: HTMLDivElement | null) => {
    scrollContainerRef.current = node;
    setScrollContainer(node);
  }, []);

  // Compute dot count based on device capabilities
  const dotCount = (() => {
    // Check for save-data preference (must be done carefully for SSR)
    const saveData = typeof navigator !== "undefined" && 
      (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;
    
    const isLowPower = prefersReducedMotion || isMobile || saveData;
    return isLowPower ? 700 : 1000;
  })();

  // Track when Day section is visible to hide nav
  useEffect(() => {
    const daySection = daySectionRef.current;
    if (!daySection) return;

    const unsubscribe = subscribe((state) => {
      const scrollContainer = getScrollContainer();
      if (!scrollContainer) return;

      const { elementTop } = measureElement(daySection, scrollContainer);
      const daySectionStart = elementTop;
      const scrollY = state.scrollY;
      
      // Hide nav when Day section is visible (when we've scrolled into it)
      // Show nav when scrolling back up (before Day section starts)
      const isDaySectionVisible = scrollY >= daySectionStart;
      
      setShouldHideNav(isDaySectionVisible);
    });

    return unsubscribe;
  }, []);

  const targetSize = isMobile ? 350 : 500;

  return (
    <DotsCanvas
      count={dotCount}
      dotRadius={1.8}
      targetWidth={targetSize}
      targetHeight={targetSize}
      targetAnchor="center"
      initialDurationMs={1500}
      transitionDurationMs={500}
      morphSpeed={0.4}
    >
      <div className="relative w-full min-h-screen flex flex-col">
        <main className="relative w-full h-screen overflow-hidden flex-shrink-0">
          <div className="relative z-10 flex h-screen">
            {/* Left column: Scrollable content */}
            <div
              ref={setScrollEl}
              className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar"
            >
              <DotsScene
                svgUrl="/assets/hero_svg.svg"
                className="relative min-h-screen"
                scrollStartOffset={-200}
                morphSpeedMult={2}
                stiffnessMult={2}
                snapOnEnter
                targetAnchor={isMobile ? "top-center" : "center"}
              >
                <HeroText />
              </DotsScene>

              <section className="relative grid h-[300vh]">
                <div className="pointer-events-none col-start-1 row-start-1">
                  <DotsScene scatter className="h-[100vh]" morphSpeedMult={2} stiffnessMult={5} targetAnchor="center-left" />
                  <DotsScene dissipate className="h-[100vh]" morphSpeedMult={2} stiffnessMult={2} targetAnchor="center-left" />
                </div>

                <div className="sticky top-0 h-screen flex items-center justify-center col-start-1 row-start-1">
                  <Problem />
                </div>
              </section>

              <section className="relative grid h-[200vh]">
                <div className="pointer-events-none col-start-1 row-start-1">
                  <DotsScene
                    svgUrl="/assets/intro.svg"
                    className="h-[200vh]"
                    scrollStartOffset={-200}
                    morphSpeedMult={2}
                    stiffnessMult={2}
                    snapOnEnter
                  />
                </div>

                <div className="sticky top-0 h-screen flex items-center justify-center col-start-1 row-start-1">
                  <Intro />
                </div>
              </section>

              <div ref={daySectionRef}>
                <Day />
              </div>

              <DayAutoEffort />

              <section className="relative grid h-[200vh]">
                <div className="pointer-events-none col-start-1 row-start-1">
                  <DotsScene dissipate className="h-[200vh]" morphSpeedMult={2} stiffnessMult={2} targetAnchor="center" />
                </div>

                <div className="sticky top-0 h-screen flex items-center justify-center col-start-1 row-start-1">
                  <SaveSpot />
                </div>
              </section>

              {/* Footer - inside scrollable content */}
              <Footer />
            </div>

            {/* Right column: Fixed Nav (doesn't scroll) - hidden on mobile and when past Day section */}
            {!shouldHideNav && (
              <div className="hidden md:flex flex-shrink-0 items-end justify-end pr-12 pb-16 pointer-events-none">
                <div className="pointer-events-auto">
                  <Nav />
                </div>
              </div>
            )}

            {/* Mobile Nav (renders its own fixed header) - hidden when past Day section */}
            {!shouldHideNav && (
              <div className="md:hidden">
                <Nav />
              </div>
            )}
          </div>
        </main>
      </div>
    </DotsCanvas>
  );
}
