"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";

export interface UseSectionProgressOptions {
  /** Offset from section start in pixels (default: 0) */
  startOffset?: number;
  /** Callback when progress changes */
  onProgress?: (progress: number) => void;
}

export interface UseSectionProgressResult {
  /** Current progress value (0-1) */
  progress: number;
  /** Section top position (for external calculations) */
  sectionTop: number;
  /** Section height (for external calculations) */
  sectionHeight: number;
}

/**
 * Hook to track scroll progress through a section.
 * Returns a progress value from 0 (section top at viewport bottom) to 1 (section bottom at viewport top).
 *
 * @param sectionRef - Ref to the section element to track
 * @param options - Configuration options
 * @returns Progress information
 *
 * @example
 * const sectionRef = useRef<HTMLElement>(null);
 * const { progress } = useSectionProgress(sectionRef);
 * // progress is 0 at start, 1 at end
 */
export function useSectionProgress(
  sectionRef: RefObject<HTMLElement | null>,
  options: UseSectionProgressOptions = {}
): UseSectionProgressResult {
  const { startOffset = 0, onProgress } = options;

  const [progress, setProgress] = useState(0);
  const sectionTopRef = useRef(0);
  const sectionHeightRef = useRef(1);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Track whether we've successfully measured with a valid scroll container
    let hasValidMeasurement = false;

    const recompute = () => {
      const scrollContainer = getScrollContainer();
      if (!scrollContainer) return;

      const { elementTop, elementHeight } = measureElement(
        section,
        scrollContainer
      );
      sectionTopRef.current = elementTop + startOffset;
      sectionHeightRef.current = Math.max(1, elementHeight);
      hasValidMeasurement = true;
    };

    recompute();
    const stopResize = observeResize(section, recompute);

    const unsubscribe = subscribe((state) => {
      // Re-measure if we haven't gotten valid measurements yet
      if (!hasValidMeasurement) {
        recompute();
      }

      const viewportH = state.viewportH;
      const scrollStart = sectionTopRef.current;
      const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
      const scrollRange = scrollEnd - scrollStart;

      if (scrollRange <= 0) {
        if (lastProgressRef.current !== 0) {
          lastProgressRef.current = 0;
          setProgress(0);
          onProgress?.(0);
        }
        return;
      }

      const rawProgress = (state.scrollY - scrollStart) / scrollRange;
      const newProgress = Math.max(0, Math.min(1, rawProgress));

      // Only update if progress changed significantly (avoid unnecessary re-renders)
      if (Math.abs(newProgress - lastProgressRef.current) > 0.001) {
        lastProgressRef.current = newProgress;
        setProgress(newProgress);
        onProgress?.(newProgress);
      }
    });

    return () => {
      stopResize();
      unsubscribe();
    };
  }, [sectionRef, startOffset, onProgress]);

  return {
    progress,
    sectionTop: sectionTopRef.current,
    sectionHeight: sectionHeightRef.current,
  };
}

export default useSectionProgress;
