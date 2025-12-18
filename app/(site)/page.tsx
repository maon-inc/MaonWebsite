"use client";

import { useRef, useEffect, useState, useCallback, useLayoutEffect } from "react";
import HeroText from "@/components/sections/home/HeroText";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import Problem from "@/components/sections/home/Problem";
import Intro from "@/components/sections/home/Intro";
import Day from "@/components/sections/home/Day";
import SaveSpot from "@/components/sections/home/SaveSpot";
import DotsCanvas from "@/components/motion/DotsCanvas";
import DotsScene from "@/components/motion/DotsScene";
import { setScrollContainer, subscribe, getScrollContainer } from "@/motion/engine";
import { measureElement } from "@/motion/measures";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const daySectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dotCount, setDotCount] = useState(100);
  const [shouldHideNav, setShouldHideNav] = useState(false);
  const setScrollEl = useCallback((node: HTMLDivElement | null) => {
    scrollContainerRef.current = node;
    setScrollContainer(node);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const getPrefersReducedMotion = () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const getSaveData = () =>
      (navigator as unknown as { connection?: { saveData?: boolean } })
        .connection?.saveData === true;

    const recompute = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      const isLowPower = getPrefersReducedMotion() || mobile || getSaveData();
      setDotCount(isLowPower ? 700 : 1000);
    };

    recompute();

    window.addEventListener("resize", recompute);

    const mql = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    if (mql) {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", recompute);
      } else {
        (mql as unknown as { addListener?: (cb: () => void) => void }).addListener?.(
          recompute
        );
      }
    }

    return () => {
      window.removeEventListener("resize", recompute);
      if (mql) {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", recompute);
        } else {
          (
            mql as unknown as { removeListener?: (cb: () => void) => void }
          ).removeListener?.(recompute);
        }
      }
    };
  }, []);

  // Track when Day section is visible to hide nav
  useEffect(() => {
    const daySection = daySectionRef.current;
    if (!daySection) return;

    const unsubscribe = subscribe((state) => {
      const scrollContainer = getScrollContainer();
      if (!scrollContainer) return;

      const { elementTop, elementHeight } = measureElement(daySection, scrollContainer);
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
              className="flex-1 overflow-y-auto hide-scrollbar"
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

              <section className="relative grid h-[200vh]">
                <div className="pointer-events-none col-start-1 row-start-1">
                  <DotsScene dissipate className="h-[200vh]" morphSpeedMult={2} stiffnessMult={2} targetAnchor="center" />
                </div>

                <div className="sticky top-0 h-screen flex items-center justify-center col-start-1 row-start-1">
                  <SaveSpot />
                </div>
              </section>

              {/* Footer - inside scrollable content, spans full width */}
              <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                <Footer />
              </div>
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
