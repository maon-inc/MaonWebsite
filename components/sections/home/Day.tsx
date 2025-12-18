"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
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
    body: "Morning haptics lift your energy while distractions stay blocked, helping you avoid doomscrolling.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-3.svg",
    iconUrl: "/assets/day_time_svg/3.svg",
    title: "Arrive Work-Ready",
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
    title: "Play Intentionally",
    body: "Your state is inferred automatically, keeping you locked in for work or free to unwind.",
  },
  {
    svgUrl: "/assets/day_in_the_life/file-6.svg",
    iconUrl: "/assets/day_time_svg/7.svg",
    title: "Relax Naturally",
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
  onPrev,
  onNext,
}: {
  steps: Step[];
  activeIndex: number;
  isDesktop: boolean;
  onPrev: () => void;
  onNext: () => void;
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
      <div className="relative text-center w-full" style={{ marginTop: "56vh" }}>
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
        {/* Navigation buttons */}
        {/* <div className="flex items-center justify-center gap-6 mt-6">
          <button 
            onClick={onPrev}
            className="p-2 transition-opacity hover:opacity-70 disabled:opacity-30"
            disabled={activeIndex === 0}
            aria-label="Previous step"
          >
            <img src="/assets/ui/backward.svg" alt="" width={14} height={18} />
          </button>
          <button 
            onClick={onNext}
            className="p-2 transition-opacity hover:opacity-70 disabled:opacity-30"
            disabled={activeIndex === steps.length - 1}
            aria-label="Next step"
          >
            <img src="/assets/ui/forward.svg" alt="" width={14} height={18} />
          </button>
        </div> */}
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
      {/* Navigation buttons */}
      {/* <div className="flex items-center gap-6 mt-6">
        <button 
          onClick={onPrev}
          className="p-2 transition-opacity hover:opacity-70 disabled:opacity-30"
          disabled={activeIndex === 0}
          aria-label="Previous step"
        >
          <img src="/assets/ui/backward.svg" alt="" width={20} height={26} />
        </button>
        <button 
          onClick={onNext}
          className="p-2 transition-opacity hover:opacity-70 disabled:opacity-30"
          disabled={activeIndex === steps.length - 1}
          aria-label="Next step"
        >
          <img src="/assets/ui/forward.svg" alt="" width={20} height={26} />
        </button>
      </div> */}
    </div>
  );
}

export default function Day() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSvgUrl, setActiveSvgUrl] = useState(steps[0].svgUrl);
  const [isDesktop, setIsDesktop] = useState(false);
  const lastActiveIndexRef = useRef(0);
  const lastProgressRef = useRef(0);
  const progressRef = useRef(0);
  const lastSvgUrlRef = useRef<string | null>(steps[0].svgUrl);
  const pendingSvgRef = useRef<string | null>(null);
  const flushSvgRafRef = useRef<number | null>(null);
  // Direct DOM refs for smooth progress bar
  const progressBarRef1 = useRef<HTMLDivElement>(null);
  const progressBarRef2 = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sectionTopRef = useRef(0);
  const sectionHeightRef = useRef(1);
  const lastStepChangeRef = useRef<number>(0);
  const STEP_CHANGE_COOLDOWN_MS = 200; // Increased cooldown for stability
  // Add refs to track pending updates:
  const pendingIndexRef = useRef<number | null>(null);
  const updateRafRef = useRef<number | null>(null);
  // Add refs for frame skipping:
  const lastScrollYRef = useRef<number>(-1);
  const frameCountRef = useRef<number>(0);
  const prevSvgUrlRef = useRef<string>(steps[0].svgUrl);
  // Auto-scroll refs
  const autoScrollRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef(false);
  const autoScrollResetTimeoutRef = useRef<number | null>(null);
  const lastUserScrollRef = useRef<number>(0);
  const USER_SCROLL_PAUSE_MS = 2000; // pause auto-scroll for 2s after user scrolls

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

  const isNearViewport = (scrollY: number, viewportH: number) => {
    const top = sectionTopRef.current;
    const height = sectionHeightRef.current;
    const buffer = viewportH * 1.5;

    return !(scrollY + viewportH < top - buffer || scrollY > top + height + buffer);
  };

  const queueSvg = (url: string) => {
    pendingSvgRef.current = url;

    if (flushSvgRafRef.current !== null) return;

    flushSvgRafRef.current = requestAnimationFrame(() => {
      flushSvgRafRef.current = null;
      const next = pendingSvgRef.current;
      pendingSvgRef.current = null;

      if (!next || next === lastSvgUrlRef.current) return;

      lastSvgUrlRef.current = next;
      setActiveSvgUrl(next);
    });
  };

  useEffect(() => {
    return () => {
      if (flushSvgRafRef.current !== null) {
        cancelAnimationFrame(flushSvgRafRef.current);
      }
      pendingSvgRef.current = null;
    };
  }, []);

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
      const rect = section.getBoundingClientRect();
      const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      sectionTopRef.current = rect.top + scrollY;
      sectionHeightRef.current = Math.max(1, rect.height);
    };

    recompute();
    const stopResize = observeResize(section, recompute);

    const unsubscribe = subscribe((state) => {
      const y = state.scrollY;
      const lastY = lastScrollYRef.current;
      if (y === lastY) return;
      lastScrollYRef.current = y;

      const viewportH = state.viewportH || window.innerHeight;
      if (!isNearViewport(y, viewportH)) {
        return;
      }

      const scrollVelocity = Math.abs(y - lastY);
      const now = performance.now();
      
      // Detect user scroll (not auto-scroll)
      if (scrollVelocity > 2 && !isAutoScrollingRef.current) {
        lastUserScrollRef.current = now;
      }
      
      frameCountRef.current++;

      // During rapid scrolling, process fewer frames but always update progress
      const isFastScrolling = scrollVelocity > 150;
      const skipFrame = isFastScrolling && frameCountRef.current % 2 !== 0;

      const scrollStart = sectionTopRef.current;
      const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
      const scrollRange = scrollEnd - scrollStart;

      if (scrollRange <= 0) {
        lastProgressRef.current = 0;
        progressRef.current = 0;
        if (progressBarRef1.current) progressBarRef1.current.style.transform = "scaleX(0)";
        if (progressBarRef2.current) progressBarRef2.current.style.transform = "scaleX(0)";
        if (lastActiveIndexRef.current !== 0) {
          lastActiveIndexRef.current = 0;
          setActiveIndex(0);
          queueSvg(steps[0].svgUrl);
        }
        return;
      }

      const rawProgress = (y - scrollStart) / scrollRange;
      const progressClamped = Math.max(0, Math.min(1, rawProgress));

      // Update progress bar directly via DOM for smooth animation
      progressRef.current = progressClamped;
      const scaleTransform = `scaleX(${progressClamped})`;
      if (progressBarRef1.current) {
        progressBarRef1.current.style.transform = scaleTransform;
      }
      if (progressBarRef2.current) {
        progressBarRef2.current.style.transform = scaleTransform;
      }

      // Skip index calculations during very fast scrolling
      if (skipFrame) {
        lastProgressRef.current = progressClamped;
        return;
      }

      const segmentLen = 1 / steps.length;
      const raw = progressClamped * steps.length;
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
          // Jump multiple steps - go directly
          nextIndex = desiredIndex;
        } else if (delta > 0) {
          const boundary = (currentIndex + 1) * segmentLen;
          if (progressClamped >= boundary + hysteresis) {
            nextIndex = desiredIndex;
          }
        } else {
          const boundary = currentIndex * segmentLen;
          if (progressClamped <= boundary - hysteresis) {
            nextIndex = desiredIndex;
          }
        }
      }

      lastProgressRef.current = progressClamped;

      if (nextIndex !== currentIndex) {
        if (now - lastStepChangeRef.current < STEP_CHANGE_COOLDOWN_MS) {
          return;
        }

        lastStepChangeRef.current = now;
        lastActiveIndexRef.current = nextIndex;
        
        // Update immediately without RAF batching for responsiveness
        setActiveIndex(nextIndex);
        queueSvg(steps[nextIndex].svgUrl);
      }
    });

    return () => {
      stopResize();
      unsubscribe();
    };
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;

    const clearAutoScrollTimeout = () => {
      if (autoScrollResetTimeoutRef.current !== null) {
        clearTimeout(autoScrollResetTimeoutRef.current);
        autoScrollResetTimeoutRef.current = null;
      }
    };

    const stopAutoScrollLoop = () => {
      if (autoScrollRef.current !== null) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      clearAutoScrollTimeout();
      isAutoScrollingRef.current = false;
    };

    const autoScroll = () => {
      const viewportH = scrollContainer.clientHeight;
      const scrollStart = sectionTopRef.current;
      const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
      const currentScroll = scrollContainer.scrollTop;
      const nearViewport = isNearViewport(currentScroll, viewportH);
      const inSection = currentScroll >= scrollStart && currentScroll < scrollEnd;

      if (!nearViewport && !inSection) {
        stopAutoScrollLoop();
        return;
      }

      const now = performance.now();
      const timeSinceUserScroll = now - lastUserScrollRef.current;
      
      // Only auto-scroll if user hasn't scrolled recently
      if (timeSinceUserScroll < USER_SCROLL_PAUSE_MS) {
        autoScrollRef.current = requestAnimationFrame(autoScroll);
        return;
      }

      // Check if we're in the Day section and not at the end
      if (inSection) {
        isAutoScrollingRef.current = true;
        // Faster auto-scroll for mobile
        const autoScrollSpeed = isDesktop ? 1.5 : 4.0;
        scrollContainer.scrollTop = currentScroll + autoScrollSpeed;
        // Reset flag after a short delay
        clearAutoScrollTimeout();
        autoScrollResetTimeoutRef.current = window.setTimeout(() => {
          isAutoScrollingRef.current = false;
          autoScrollResetTimeoutRef.current = null;
        }, 50);
      }

      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    const ensureAutoScroll = () => {
      if (autoScrollRef.current !== null) return;
      const viewportH = scrollContainer.clientHeight;
      const scrollStart = sectionTopRef.current;
      const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
      const currentScroll = scrollContainer.scrollTop;
      const inSection = currentScroll >= scrollStart && currentScroll < scrollEnd;
      if (isNearViewport(currentScroll, viewportH) || inSection) {
        autoScrollRef.current = requestAnimationFrame(autoScroll);
      }
    };

    const handleScroll = () => {
      const viewportH = scrollContainer.clientHeight;
      const scrollStart = sectionTopRef.current;
      const scrollEnd = sectionTopRef.current + sectionHeightRef.current - viewportH;
      const currentScroll = scrollContainer.scrollTop;
      const inSection = currentScroll >= scrollStart && currentScroll < scrollEnd;

      if (!isNearViewport(currentScroll, viewportH) && !inSection) {
        stopAutoScrollLoop();
        return;
      }

      ensureAutoScroll();
    };

    const handleResize = () => {
      ensureAutoScroll();
    };

    ensureAutoScroll();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      stopAutoScrollLoop();
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Add separate effect for SVG retargeting:
  useEffect(() => {
    if (activeSvgUrl !== prevSvgUrlRef.current) {
      const goingUp = activeIndex < (steps.findIndex(s => s.svgUrl === prevSvgUrlRef.current) ?? 0);
      prevSvgUrlRef.current = activeSvgUrl;
      
      retargetToSvg(activeSvgUrl, goingUp ? "snap" : "soft", {
        burstMs: 150,
        stiffnessMult: 3.0,
        dampingMult: 0.92,
        maxSpeedMult: 2.2,
      });
    }
  }, [activeSvgUrl, activeIndex]);

  const svgScale = isDesktop ? 1.5 : 1.1;
  const dotAnchor = isDesktop ? "bottom-right" : "top-center";
  const lockInMs = isDesktop ? 300 : 200;
  const homeSnapMs = isDesktop ? 200 : 150;
  const swayRampMs = isDesktop ? 600 : 500;
  const settleRadiusPx = isDesktop ? 10 : 8;
  const snapRadiusPx = isDesktop ? 12 : 10;
  const snapSpeedPxPerSec = isDesktop ? 450 : 400;
  const targetOffsetY = isDesktop ? -100 : -80;

  return (
    <section ref={sectionRef} className="relative grid h-[1000vh]">
      {/* DotsScene layer - covers full section height for scroll registration */}
      <div className="pointer-events-none col-start-1 row-start-1">
        <DotsScene
          svgUrl={activeSvgUrl}
          className="h-full"
          stiffnessMult={3.5}
          dampingMult={0.88}
          maxSpeedMult={2.0}
          snapOnEnter
          targetScale={svgScale}
          targetAnchor={dotAnchor}
          targetOffsetY={targetOffsetY}
          lockInMs={lockInMs}
          homeSnapMs={homeSnapMs}
          swayRampMs={swayRampMs}
          swayStyle="targetOffset"
          morphSpeedMult={5.5}
          settleRadiusPx={settleRadiusPx}
          snapRadiusPx={snapRadiusPx}
          snapSpeedPxPerSec={snapSpeedPxPerSec}
        />
      </div>

      {/* Content in sticky container */}
      <div className={`sticky top-0 h-screen flex ${isDesktop ? "items-center justify-start" : "items-start justify-center"} pb-16 md:pb-24 col-start-1 row-start-1`}>
        {/* Text box - fixed position on mobile, positioned above the icon */}
        <div className={`absolute ${isDesktop ? "hidden" : "block"} top-[48vh] left-1/2 -translate-x-1/2 rounded-[10px] px-8 py-2 z-20 whitespace-nowrap overflow-hidden`} style={{ border: "0.9px solid black" }}>
          {/* Progress fill */}
          <div 
            ref={progressBarRef1}
            className="absolute inset-0 rounded-[10px]" 
            style={{ 
              backgroundColor: "#97CEE7",
              transform: "scaleX(0)",
              transformOrigin: "left center",
              willChange: "transform"
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
            style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
          >
            {steps.map((s, i) => (
              <button
                key={s.title + i}
                type="button"
                onClick={() => scrollToStep(i)}
                className="h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/60"
                aria-label={`Go to step ${i + 1}: ${s.title}`}
              />
            ))}
          </div>
          <p className="relative text-[14px] font-[var(--font-sans)]">DAY IN THE LIFE WITH MAON</p>
        </div>
        <div className={`flex flex-col ${isDesktop ? "items-start justify-start" : "items-center justify-start"} px-6 md:px-12 lg:px-16 relative z-10 w-full`}>
          {/* Text box - desktop only */}
          <div className={`absolute ${isDesktop ? "top-[4rem] ml-20" : "hidden"} rounded-[10px] px-8 py-2 z-20 whitespace-nowrap overflow-hidden`} style={{ border: "0.9px solid black" }}>
            {/* Progress fill */}
            <div 
              ref={progressBarRef2}
              className="absolute inset-0 rounded-[10px]" 
              style={{ 
                backgroundColor: "#97CEE7",
                transform: "scaleX(0)",
                transformOrigin: "left center",
                willChange: "transform"
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
              style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
            >
              {steps.map((s, i) => (
                <button
                  key={s.title + i}
                  type="button"
                  onClick={() => scrollToStep(i)}
                  className="h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/60"
                  aria-label={`Go to step ${i + 1}: ${s.title}`}
                />
              ))}
            </div>
            <p className="relative text-[14px] font-[var(--font-sans)]">DAY IN THE LIFE WITH MAON</p>
          </div>
          <CrossfadeText
            steps={steps}
            activeIndex={activeIndex}
            isDesktop={isDesktop}
            onPrev={() => {
              if (activeIndex > 0) {
                scrollToStep(activeIndex - 1);
              }
            }}
            onNext={() => {
              if (activeIndex < steps.length - 1) {
                scrollToStep(activeIndex + 1);
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
