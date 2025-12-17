"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";
import DotsScene from "@/components/motion/DotsScene";
import { retargetToSvg } from "@/components/motion/DotsCanvas";

interface Step {
  svgUrl: string;
  iconUrl: string;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    svgUrl: "/assets/day_in_the_life/file-1.svg",
    iconUrl: "/assets/day_time_svg/1.svg",
    title: "Wake Calmly",
    body: "Gentle haptics wake you smoothly, so you start the day steady instead of startled.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-2.svg",
    iconUrl: "/assets/day_time_svg/2.svg",
    title: "Start Energized",
    body: "Morning haptics lift your energy while distractions stay blocked, helping you avoid reflexive scrolling.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-3.svg",
    iconUrl: "/assets/day_time_svg/3.svg",
    title: "Arrive at Work Centered",
    body: "When stress rises, calming patterns stabilize your body so you stay clear and productive.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-4.svg",
    iconUrl: "/assets/day_time_svg/4.svg",
    title: "Maintain Focus",
    body: "As attention dips, energizing haptics restore focus and prevent the midday slump.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-4.svg",
    iconUrl: "/assets/day_time_svg/5.svg",
    title: "Drive Safely",
    body: "Balanced haptics keep arousal in check so you stay alert and avoid end-of-day fatigue on the road.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-5.svg",
    iconUrl: "/assets/day_time_svg/6.svg",
    title: "Play or Work Intentionally",
    body: "Your state is inferred automatically, keeping you locked in for work or free to unwind.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-6.svg",
    iconUrl: "/assets/day_time_svg/7.svg",
    title: "Wind Down Naturally",
    body: "Calming patterns ease your body into rest while impulse-driven apps stay out of reach.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-7.svg",
    iconUrl: "/assets/day_time_svg/8.svg",
    title: "Sleep Deeply",
    body: "Haptics calm your nervous system, helping you fall asleep and recover more effectively.",
  }
];

const svgUrls = steps.map(s => s.svgUrl);

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
      }, 300); // Half of transition duration
    }

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [activeIndex, displayIndex]);

  const step = steps[displayIndex];

  // Mobile: icon is fixed position, title and body flow with margin-top
  if (!isDesktop) {
    return (
      <div className="relative text-center w-full" style={{ marginTop: "60vh" }}>
        {/* Icon - fixed position at top of this container */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex justify-center"
          style={{ top: 0, height: "50px" }}
        >
          <img
            src={step.iconUrl}
            alt=""
            aria-hidden="true"
            style={{ width: "50px", height: "50px", opacity, transition: "opacity 300ms ease-in-out" }}
          />
        </div>
        {/* Title - flows below icon with margin-top */}
        <h2
          className="text-d-merriweather-32-regular mt-16 mb-3 px-4"
          style={{
            opacity,
            transition: "opacity 300ms ease-in-out",
          }}
        >
          {step.title}
        </h2>
        {/* Body text - flows below title */}
        <p
          className="text-d-lato-24-regular w-[350px] mx-auto"
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

  // Desktop layout
  return (
    <div className="relative text-left max-w-[500px] mt-32 ml-20">
      {/* Icon - fixed position and size */}
      <div className="mb-6" style={{ height: "50px" }}>
        <img
          src={step.iconUrl}
          alt=""
          aria-hidden="true"
          style={{ width: "50px", height: "50px", opacity, transition: "opacity 300ms ease-in-out" }}
        />
      </div>
      {/* Title - fixed height to prevent layout shift */}
      <h2
        className="text-d-merriweather-32-regular mb-4"
        style={{
          opacity,
          transition: "opacity 300ms ease-in-out",
          minHeight: "41.6px",
        }}
      >
        {step.title}
      </h2>
      {/* Body text - can vary in height */}
      <p
        className="text-d-lato-24-regular w-[400px]"
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
  const [activeSvgUrl, setActiveSvgUrl] = useState(steps[0].svgUrl);
  const [isDesktop, setIsDesktop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastActiveIndexRef = useRef(0);
  const lastProgressRef = useRef(0);
  const progressRef = useRef(0);
  const lastSvgUrlRef = useRef(steps[0].svgUrl);
  const sectionRef = useRef<HTMLElement>(null);
  const sectionTopRef = useRef(0);
  const sectionHeightRef = useRef(1);
  const lastStepChangeRef = useRef<number>(0);
  const STEP_CHANGE_COOLDOWN_MS = 150; // Minimum time between step changes
  // Add refs to track pending updates:
  const pendingIndexRef = useRef<number | null>(null);
  const updateRafRef = useRef<number | null>(null);
  // Add refs for frame skipping:
  const lastScrollYRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const prevSvgUrlRef = useRef<string>(steps[0].svgUrl);

  useEffect(() => {
    // Preload all SVGs on mount to avoid loading during scroll
    const uniqueSvgUrls = [...new Set(steps.map(s => s.svgUrl))];
    
    uniqueSvgUrls.forEach(url => {
      // Trigger cache population
      fetch(url)
        .then(res => res.text())
        .catch(() => {}); // Ignore errors, just warm cache
    });
  }, []);

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
      // Add velocity-based frame skipping:
      const scrollVelocity = Math.abs(state.scrollY - lastScrollYRef.current);
      lastScrollYRef.current = state.scrollY;
      frameCountRef.current++;

      // Skip expensive calculations during very fast scrolling
      const isFastScrolling = scrollVelocity > 100; // pixels per frame
      if (isFastScrolling && frameCountRef.current % 3 !== 0) {
        return; // Process every 3rd frame during fast scroll
      }

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
      
      // Update scroll progress for the progress bar (throttled)
      if (Math.abs(progress - progressRef.current) > 0.005) {
        progressRef.current = progress;
        setScrollProgress(progress);
      }

      if (nextIndex !== currentIndex) {
        const now = performance.now();
        if (now - lastStepChangeRef.current < STEP_CHANGE_COOLDOWN_MS) {
          return;
        }

        lastStepChangeRef.current = now;
        lastActiveIndexRef.current = nextIndex;
        pendingIndexRef.current = nextIndex;

        // Batch React updates outside the scroll handler
        if (updateRafRef.current === null) {
          updateRafRef.current = requestAnimationFrame(() => {
            updateRafRef.current = null;
            const idx = pendingIndexRef.current;
            if (idx !== null) {
              setActiveIndex(idx);
              const svgUrl = steps[idx].svgUrl;
              if (svgUrl !== lastSvgUrlRef.current) {
                lastSvgUrlRef.current = svgUrl;
                setActiveSvgUrl(svgUrl);
              }
            }
          });
        }
      }
    });

    return () => {
      if (updateRafRef.current !== null) {
        cancelAnimationFrame(updateRafRef.current);
      }
      stopResize();
      unsubscribe();
    };
  }, []);

  // Add separate effect for SVG retargeting:
  useEffect(() => {
    if (activeSvgUrl !== prevSvgUrlRef.current) {
      const goingUp = activeIndex < (steps.findIndex(s => s.svgUrl === prevSvgUrlRef.current) ?? 0);
      prevSvgUrlRef.current = activeSvgUrl;
      
      retargetToSvg(activeSvgUrl, goingUp ? "snap" : "soft", {
        burstMs: 250,
        stiffnessMult: 2.0,
        dampingMult: 0.94,
        maxSpeedMult: 1.6,
      });
    }
  }, [activeSvgUrl, activeIndex]);

  const svgScale = isDesktop ? 1.5 : 1.3;
  const dotAnchor = isDesktop ? "bottom-right" : "top-center";
  const lockInMs = isDesktop ? 500 : 350;
  const homeSnapMs = isDesktop ? 350 : 280;
  const swayRampMs = isDesktop ? 900 : 700;
  const settleRadiusPx = isDesktop ? 10 : 8;
  const snapRadiusPx = isDesktop ? 12 : 10;
  const snapSpeedPxPerSec = isDesktop ? 400 : 350;
  const targetOffsetY = isDesktop ? -100 : -60;

  return (
    <section ref={sectionRef} className="relative grid h-[800vh]">
      {/* DotsScene layer - covers full section height for scroll registration */}
      <div className="pointer-events-none col-start-1 row-start-1">
        <DotsScene
          svgUrl={activeSvgUrl}
          className="h-full"
          stiffnessMult={2.5}
          dampingMult={0.9}
          maxSpeedMult={1.5}
          snapOnEnter
          targetScale={svgScale}
          targetAnchor={dotAnchor}
          targetOffsetY={targetOffsetY}
          lockInMs={lockInMs}
          homeSnapMs={homeSnapMs}
          swayRampMs={swayRampMs}
          swayStyle="targetOffset"
          morphSpeedMult={4.0}
          settleRadiusPx={settleRadiusPx}
          snapRadiusPx={snapRadiusPx}
          snapSpeedPxPerSec={snapSpeedPxPerSec}
        />
      </div>

      {/* Content in sticky container */}
      <div className={`sticky top-0 h-screen flex ${isDesktop ? "items-center justify-start" : "items-start justify-center"} pb-16 md:pb-24 col-start-1 row-start-1`}>
        {/* Text box - fixed position on mobile, positioned above the icon */}
        <div className={`absolute ${isDesktop ? "hidden" : "block"} top-[54vh] left-1/2 -translate-x-1/2 rounded-[10px] px-8 py-2 z-20 whitespace-nowrap overflow-hidden`} style={{ border: "0.9px solid black" }}>
          {/* Progress fill */}
          <div 
            className="absolute inset-0 rounded-[10px]" 
            style={{ 
              backgroundColor: "#97CEE7", 
              width: `${scrollProgress * 100}%`,
              transition: "width 100ms ease-out"
            }} 
          />
          <p className="relative text-[14px] font-[var(--font-sans)]">DAY IN THE LIFE WITH MAON</p>
        </div>
        <div className={`flex flex-col ${isDesktop ? "items-start justify-start" : "items-center justify-start"} px-6 md:px-12 lg:px-16 relative z-10 w-full`}>
          {/* Text box - desktop only */}
          <div className={`absolute ${isDesktop ? "top-[4rem] ml-20" : "hidden"} rounded-[10px] px-8 py-2 z-20 whitespace-nowrap overflow-hidden`} style={{ border: "0.9px solid black" }}>
            {/* Progress fill */}
            <div 
              className="absolute inset-0 rounded-[10px]" 
              style={{ 
                backgroundColor: "#97CEE7", 
                width: `${scrollProgress * 100}%`,
                transition: "width 100ms ease-out"
              }} 
            />
            <p className="relative text-[14px] font-[var(--font-sans)]">DAY IN THE LIFE WITH MAON</p>
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
