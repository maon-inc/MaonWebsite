"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";

export default function Problem() {
  const [progress, setProgress] = useState(0);
  const lastProgressRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionTopRef = useRef(0);
  const sectionHeightRef = useRef(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stickyDiv = container.parentElement;
    const section = stickyDiv?.parentElement as HTMLElement | null;
    if (!section) return;

    const recompute = () => {
      const { elementTop, elementHeight } = measureElement(
        section,
        getScrollContainer()
      );
      sectionTopRef.current = elementTop;
      sectionHeightRef.current = Math.max(1, elementHeight);
    };

    recompute();
    const stopResize = observeResize(section, recompute);

    const unsubscribe = subscribe((state) => {
      const viewportH = state.viewportH;
      const scrollStart = sectionTopRef.current;
      const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
      const scrollRange = scrollEnd - scrollStart;

      if (scrollRange <= 0) {
        if (lastProgressRef.current !== 0) {
          lastProgressRef.current = 0;
          setProgress(0);
        }
        return;
      }

      const rawProgress = (state.scrollY - scrollStart) / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      const last = lastProgressRef.current;
      // Only update state if progress has meaningfully changed
      // Use a slightly larger threshold to reduce re-renders
      const hasReachedBoundary = (clampedProgress === 0 && last !== 0) || 
                                  (clampedProgress === 1 && last !== 1);
      const hasSignificantChange = Math.abs(clampedProgress - last) > 0.01;
      
      if (hasReachedBoundary || hasSignificantChange) {
        lastProgressRef.current = clampedProgress;
        setProgress(clampedProgress);
      }
    });

    return () => {
      stopResize();
      unsubscribe();
    };
  }, []);

  // First paragraph: fades out through the "problem" phase.
  // Resolution begins when the dissipate scene starts (see page layout).
  // With 100vh scatter + 100vh dissipate in a 300vh section, dissipate starts at 50% scroll.
  const resolutionStart = 1 / 2;
  const fadeOutProgress = Math.min(1, progress / resolutionStart);
  const fadeOutOpacity = 1 - fadeOutProgress * 0.85;

  // Second paragraph: becomes active during the "resolution" phase.
  const fadeInProgress = Math.max(0, (progress - resolutionStart) / (1 - resolutionStart));
  const fadeInOpacity = 0.15 + fadeInProgress * 0.85;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center px-6 md:px-16 lg:px-24 xl:px-32 w-full h-full"
    >
      <div className="text-left max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <p
          className="text-m-merriweather-30-regular md:text-d-merriweather-45-regular mb-6 text-[var(--text-primary)]"
          style={{ opacity: fadeOutOpacity }}
        >
          10 minutes. That is how often your nervous system is interrupted. And
          because of that, stress accumulates and balance slips away.
        </p>
        <p
          className="text-m-merriweather-30-regular md:text-d-merriweather-45-regular text-[var(--text-primary)]"
          style={{ opacity: fadeInOpacity }}
        >
          It is time to restore balance.
        </p>
      </div>
    </div>
  );
}
