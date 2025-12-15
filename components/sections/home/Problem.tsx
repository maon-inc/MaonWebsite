"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";

export default function Problem() {
  const [progress, setProgress] = useState(0);
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
        setProgress(0);
        return;
      }

      const rawProgress = (state.scrollY - scrollStart) / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      setProgress(clampedProgress);
    });

    return () => {
      stopResize();
      unsubscribe();
    };
  }, []);

  // First paragraph: fades out through the "problem" phase.
  // Resolution begins when the dissipate scene starts (see page layout).
  const resolutionStart = 2 / 3;
  const fadeOutProgress = Math.min(1, progress / resolutionStart);
  const fadeOutOpacity = 1 - fadeOutProgress * 0.85;

  // Second paragraph: becomes active during the "resolution" phase.
  const fadeInProgress = Math.max(0, (progress - resolutionStart) / (1 - resolutionStart));
  const fadeInOpacity = 0.15 + fadeInProgress * 0.85;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center px-6 md:px-0 md:w-[600px] lg:w-[1000px] h-full"
    >
      <div className="text-left">
        <p
          className="text-m-merriweather-30-regular md:text-d-merriweather-45-regular mb-6"
          style={{ color: `rgba(23, 23, 23, ${fadeOutOpacity})` }}
        >
          10 minutes. That is how often your nervous system is interrupted. And
          because of that, stress accumulates and balance slips away.
        </p>
        <p
          className="text-m-merriweather-30-regular md:text-d-merriweather-45-regular"
          style={{ color: `rgba(23, 23, 23, ${fadeInOpacity})` }}
        >
          It is time to restore balance.
        </p>
      </div>
    </div>
  );
}
