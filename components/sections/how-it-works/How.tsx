"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import Link from "next/link";

interface Step {
  text: string;
}

const steps: Step[] = [
  {
    text: "Scroll as you normally would",
  },
  {
    text: "Step 1. Maon collects your body's signals & your digital device's app activity.",
  },
  {
    text: "Step 2. Maon uses that data & AI to classify your emotions in real time.",
  },
  {
    text: "Step 3. Maon uses the classified emotion to trigger haptic patterns & app limits to make you more balanced.",
  },
];

function CrossfadeText({
  steps,
  activeIndex,
  isDesktop,
}: {
  steps: Step[];
  activeIndex: number;
  isDesktop: boolean;
}) {
  const [displayIndex, setDisplayIndex] = useState(activeIndex);
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex !== displayIndex) {
      // Start fade out
      setOpacity(0);

      // After fade completes, switch content and fade in
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setDisplayIndex(activeIndex);
        // Trigger fade in on next frame
        requestAnimationFrame(() => {
          setOpacity(1);
        });
      }, 300);
    }

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [activeIndex, displayIndex]);

  const step = steps[displayIndex];

  return (
    <div
      className={`relative ${isDesktop ? "text-left max-w-[600px]" : "text-center w-full px-6"}`}
    >
      <p
        className={isDesktop ? "text-d-merriweather-40-regular" : "text-d-merriweather-24-regular"}
        style={{
          opacity,
          transition: "opacity 300ms ease-in-out",
        }}
      >
        {step.text}
      </p>
    </div>
  );
}

interface HowProps {
  onIndexChange?: (index: number) => void;
  children?: ReactNode;
}

export default function How({ onIndexChange, children }: HowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = useIsDesktop();
  const lastActiveIndexRef = useRef(0);
  const lastProgressRef = useRef(0);
  const progressRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  // Direct DOM ref for smooth progress bar
  const progressBarRef = useRef<HTMLDivElement>(null);
  const sectionTopRef = useRef(0);
  const sectionHeightRef = useRef(1);
  const lastStepChangeRef = useRef<number>(0);
  const STEP_CHANGE_COOLDOWN_MS = 100; // Reduced for better click responsiveness
  const lastScrollYRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const scrollToStep = (index: number) => {
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;

    const viewportH = scrollContainer.clientHeight;
    const scrollStart = sectionTopRef.current;
    const scrollRange = sectionHeightRef.current - viewportH;
    if (scrollRange <= 0) return;

    const clampedIndex = Math.max(0, Math.min(steps.length - 1, index));
    // Scroll to the center of the segment for a stable "scene" position.
    const targetProgress = (clampedIndex + 0.5) / steps.length;
    const targetScrollY = scrollStart + targetProgress * scrollRange;

    scrollContainer.scrollTo({ top: targetScrollY, behavior: "smooth" });
  };

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
      sectionTopRef.current = elementTop;
      sectionHeightRef.current = Math.max(1, elementHeight);
      hasValidMeasurement = true;
    };

    recompute();
    const stopResize = observeResize(section, recompute);

    const unsubscribe = subscribe((state) => {
      // Re-measure if we haven't gotten valid measurements yet
      // This handles the race condition where the scroll container
      // wasn't set when the component first mounted
      if (!hasValidMeasurement) {
        recompute();
      }
      const scrollVelocity = Math.abs(state.scrollY - lastScrollYRef.current);
      const now = performance.now();
      
      lastScrollYRef.current = state.scrollY;
      frameCountRef.current++;

      // During rapid scrolling, process fewer frames but always update progress
      const isFastScrolling = scrollVelocity > 150;
      const skipFrame = isFastScrolling && frameCountRef.current % 2 !== 0;

      const viewportH = state.viewportH;
      const scrollStart = sectionTopRef.current;
      const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
      const scrollRange = scrollEnd - scrollStart;

      if (scrollRange <= 0) {
        lastProgressRef.current = 0;
        progressRef.current = 0;
        if (progressBarRef.current) progressBarRef.current.style.width = '0%';
        if (lastActiveIndexRef.current !== 0) {
          lastActiveIndexRef.current = 0;
          setActiveIndex(0);
          onIndexChange?.(0);
        }
        return;
      }

      const rawProgress = (state.scrollY - scrollStart) / scrollRange;
      const progress = Math.max(0, Math.min(1, rawProgress));

      // Update progress bar directly via DOM for smooth animation
      progressRef.current = progress;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }

      // Skip index calculations during very fast scrolling
      if (skipFrame) {
        lastProgressRef.current = progress;
        return;
      }

      const segmentLen = 1 / steps.length;
      const raw = progress * steps.length;
      const desiredIndex = Math.max(
        0,
        Math.min(steps.length - 1, Math.floor(raw))
      );

      const currentIndex = lastActiveIndexRef.current;
      const hysteresis = 0.015 * segmentLen;

      let nextIndex = currentIndex;
      const delta = desiredIndex - currentIndex;
      if (delta !== 0) {
        if (Math.abs(delta) > 1) {
          nextIndex = desiredIndex;
        } else if (delta > 0) {
          const boundary = (currentIndex + 1) * segmentLen;
          if (progress >= boundary + hysteresis) {
            nextIndex = desiredIndex;
          }
        } else {
          const boundary = currentIndex * segmentLen;
          if (progress <= boundary - hysteresis) {
            nextIndex = desiredIndex;
          }
        }
      }

      lastProgressRef.current = progress;

      if (nextIndex !== currentIndex) {
        if (now - lastStepChangeRef.current < STEP_CHANGE_COOLDOWN_MS) {
          return;
        }

        lastStepChangeRef.current = now;
        lastActiveIndexRef.current = nextIndex;
        
        // Update immediately without RAF batching for responsiveness
        setActiveIndex(nextIndex);
        onIndexChange?.(nextIndex);
      }
    });

    return () => {
      stopResize();
      unsubscribe();
    };
  }, [onIndexChange]);



  return (
    <section ref={sectionRef} className="relative grid h-[600vh]">
      {/* Back button - fixed position */}
      <Link
        href="/"
        className="fixed top-6 left-6 md:top-8 md:left-8 z-50 transition-opacity hover:opacity-70"
        aria-label="Go back"
      >
        <img
          src="/assets/ui/back_button.svg"
          alt=""
          className="w-4 h-4 md:w-6 md:h-6"
        />
      </Link>

      {/* DotsScene layer - covers full section height for scroll registration */}
      <div className="pointer-events-none col-start-1 row-start-1">
        {children}
      </div>

      {/* Content in sticky container */}
      <div
        className={`sticky top-0 h-screen flex ${
          isDesktop ? "items-start justify-start pl-20" : "items-end justify-center pb-32"
        } col-start-1 row-start-1`}
      >
        <div className={`flex flex-col ${isDesktop ? "items-start mt-100" : "items-center"}`}>
          {/* Progress bar with HOW IT WORKS text */}
          <div className="rounded-[10px] px-8 py-2 mb-4 whitespace-nowrap overflow-hidden relative" style={{ border: "0.9px solid black" }}>
            {/* Progress fill */}
            <div 
              ref={progressBarRef}
              className="absolute inset-0 rounded-[10px]" 
              style={{ 
                backgroundColor: "#97CEE7", 
                width: "0%",
                willChange: "width",
              }} 
            />
            {/* Segment dividers (one per step) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[10px] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, rgba(0,0,0,0.35), rgba(0,0,0,0.35) 1px, transparent 1px, transparent)",
                backgroundSize: `calc(100% / ${steps.length}) 100%`,
                opacity: 0.35,
              }}
            />
            {/* Clickable segments */}
            <div
              className="absolute inset-0 z-30 grid"
              style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, touchAction: "manipulation" }}
            >
              {steps.map((s, i) => (
                <button
                  key={s.text + i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    scrollToStep(i);
                  }}
                  className="h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/60"
                  style={{ touchAction: "manipulation" }}
                  aria-label={`Go to step ${i + 1}: ${s.text}`}
                />
              ))}
            </div>
            <p className="relative text-[14px] font-[var(--font-sans)]">HOW IT WORKS</p>
          </div>
          <CrossfadeText
            steps={steps}
            activeIndex={activeIndex}
            isDesktop={isDesktop}
          />
        </div>
      </div>
    </section>
  );
}

export { steps };
