"use client";

import { useEffect, useRef, useState } from "react";
import { subscribe } from "@/motion/engine";

export default function Problem() {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      const container = containerRef.current;
      if (!container) return;

      // Navigate up: Problem div -> sticky div -> section (h-[300vh])
      const stickyDiv = container.parentElement;
      const section = stickyDiv?.parentElement;
      if (!section) return;

      // Get the section's scroll-relative position
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportH = state.viewportH;

      // Progress goes from 0 to 1 as we scroll through the tall section
      // Start when section top reaches viewport top
      // End when section bottom reaches viewport bottom
      const scrollStart = sectionTop;
      const scrollEnd = sectionTop + sectionHeight - viewportH;
      const scrollRange = scrollEnd - scrollStart;

      if (scrollRange <= 0) {
        setProgress(0);
        return;
      }

      const rawProgress = (state.scrollY - scrollStart) / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      setProgress(clampedProgress);
    });

    return unsubscribe;
  }, []);

  // First paragraph: starts fully visible, fades to gray as you scroll
  // Fades from opacity 1 to 0.15 over progress 0 to 0.6
  const fadeOutProgress = Math.min(1, progress / 0.6);
  const fadeOutOpacity = 1 - fadeOutProgress * 0.85;

  // Second paragraph: starts gray, becomes visible as you scroll
  // Fades from opacity 0.15 to 1 over progress 0.4 to 1
  const fadeInProgress = Math.max(0, (progress - 0.4) / 0.6);
  const fadeInOpacity = 0.15 + fadeInProgress * 0.85;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center md:w-[600px] lg:w-[1000px] h-full"
    >
      <div className="text-left">
        <p
          className="text-d-merriweather-45-regular mb-6"
          style={{ color: `rgba(23, 23, 23, ${fadeOutOpacity})` }}
        >
          10 minutes. That is how often your nervous system is interrupted. And
          because of that, stress accumulates and balance slips away.
        </p>
        <p
          className="text-d-merriweather-45-regular"
          style={{ color: `rgba(23, 23, 23, ${fadeInOpacity})` }}
        >
          It is time to restore balance.
        </p>
      </div>
    </div>
  );
}
