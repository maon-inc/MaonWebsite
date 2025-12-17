"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";
import DotsScene from "@/components/motion/DotsScene";
import { retargetToSvg } from "@/components/motion/DotsCanvas";

interface Step {
  svgUrl: string;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    svgUrl: "/assets/day_in_the_life/file-1.svg",
    title: "Morning begins",
    body: "The day starts with intention, setting the foundation for what's to come.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-2.svg",
    title: "Finding focus",
    body: "As the hours unfold, clarity emerges from the morning's calm.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-3.svg",
    title: "Building momentum",
    body: "Energy flows naturally, carrying you through the day's rhythm.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-4.svg",
    title: "Peak performance",
    body: "At the height of the day, everything aligns in perfect harmony.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-5.svg",
    title: "Sustained balance",
    body: "The steady pace continues, maintaining equilibrium throughout.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-6.svg",
    title: "Evening transition",
    body: "The day begins to wind down, preparing for rest and renewal.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-7.svg",
    title: "Peaceful conclusion",
    body: "The day ends with a sense of completion and quiet satisfaction.",
  },
];

function CrossfadeText({
  steps,
  activeIndex,
}: {
  steps: Step[];
  activeIndex: number;
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
      }, 300); // Half of transition duration
    }

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [activeIndex, displayIndex]);

  const step = steps[displayIndex];

  return (
    <div className="text-left max-w-[600px]">
      <h2
        className="text-d-merriweather-32-regular mb-6"
        style={{
          opacity,
          transition: "opacity 300ms ease-in-out",
        }}
      >
        {step.title}
      </h2>
      <p
        className="text-d-lato-24-regular"
        style={{
          opacity,
          transition: "opacity 300ms ease-in-out",
        }}
      >
        {step.body}
      </p>
    </div>
  );
}

export default function Day() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const lastActiveIndexRef = useRef(0);
  const lastProgressRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const sectionTopRef = useRef(0);
  const sectionHeightRef = useRef(1);

  useEffect(() => {
    const mql = window.matchMedia
      ? window.matchMedia("(min-width: 768px)")
      : null;

    const update = () => {
      setIsDesktop(mql ? mql.matches : window.innerWidth >= 768);
    };

    update();

    if (mql) {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", update);
      } else {
        (mql as unknown as { addListener?: (cb: () => void) => void }).addListener?.(
          update
        );
      }
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (mql) {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", update);
        } else {
          (
            mql as unknown as { removeListener?: (cb: () => void) => void }
          ).removeListener?.(update);
        }
      } else {
        window.removeEventListener("resize", update);
      }
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const recompute = () => {
      const scrollContainer = getScrollContainer();
      if (!scrollContainer) return;
      
      const { elementTop, elementHeight } = measureElement(
        section,
        scrollContainer
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
        const newIndex = 0;
        lastProgressRef.current = 0;
        if (newIndex !== lastActiveIndexRef.current) {
          lastActiveIndexRef.current = newIndex;
          setActiveIndex(newIndex);
        }
        return;
      }

      const rawProgress = (state.scrollY - scrollStart) / scrollRange;
      const progress = Math.max(0, Math.min(1, rawProgress));

      const segmentLen = 1 / steps.length;
      const raw = progress * steps.length;
      const desiredIndex = Math.max(
        0,
        Math.min(steps.length - 1, Math.floor(raw))
      );

      const currentIndex = lastActiveIndexRef.current;
      const lastProgress = lastProgressRef.current;
      const goingUp = progress < lastProgress;
      const hysteresis = 0.02 * segmentLen;

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
        lastActiveIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        retargetToSvg(
          steps[nextIndex].svgUrl,
          goingUp ? "snap" : "soft",
          {
            burstMs: 250,
            stiffnessMult: 2.0,
            dampingMult: 0.9,
            maxSpeedMult: 1.6,
          }
        );
      }
    });

    return () => {
      stopResize();
      unsubscribe();
    };
  }, []);

  const currentStep = steps[activeIndex];
  const svgScale = isDesktop ? 1.5 : 1.0;

  return (
    <section ref={sectionRef} className="relative grid h-[800vh]">
      {/* DotsScene layer - covers full section height for scroll registration */}
      <div className="pointer-events-none col-start-1 row-start-1">
        <DotsScene
          svgUrl={currentStep.svgUrl}
          className="h-full"
          stiffnessMult={1.8}
          dampingMult={0.9}
          maxSpeedMult={1.5}
          snapOnEnter
          targetScale={svgScale}
        />
      </div>

      {/* Content in sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center col-start-1 row-start-1">
        <div className="flex flex-col items-center justify-center px-6 md:px-0 h-full gap-12 relative z-10">
          <CrossfadeText
            steps={steps}
            activeIndex={activeIndex}
          />
        </div>
      </div>
    </section>
  );
}
