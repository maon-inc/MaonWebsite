"use client";

import { useEffect, useMemo, useRef, useId, useCallback } from "react";
import { useDotsCanvas, type DotTargetProvider } from "./DotsCanvas";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";
import { getScrollContainer } from "@/motion/engine";
import { generateDissipateTargets, generateScatterTargets } from "./dotsTargets";

interface DotsSceneProps {
  /** URL to the SVG file for this scene's dot formation */
  svgUrl?: string;
  scatter?: boolean;
  /** Back-compat alias for `dissipate` */
  disperse?: boolean;
  dissipate?: boolean;
  /** Per-scene physics overrides (active scene only). Default: 1 */
  stiffnessMult?: number;
  /** Per-scene physics overrides (active scene only). Default: 1 */
  dampingMult?: number;
  /** Per-scene physics overrides (active scene only). Default: 1 */
  maxSpeedMult?: number;
  /** If true, apply a brief "fast settle" burst when this scene becomes active or svgUrl changes. */
  snapOnEnter?: boolean;
  /** Scale applied when fitting SVG points (not a CSS transform). Default: 1 */
  targetScale?: number;
  /** Optional multiplier for morph speed when this scene is active. Default: 1 (no change) */
  morphSpeedMult?: number;
  /** Lock window duration (ms) to disable noise/jitter; default 0 (off) */
  lockInMs?: number;
  /** Lock window duration to force home snapping (ms); default 0 (off) */
  homeSnapMs?: number;
  /** Ramp-in duration for sway after lock ends; default 0 (off) */
  swayRampMs?: number;
  /** Sway style; default is current force-based behavior */
  swayStyle?: "force" | "targetOffset";
  /** Distance at which sway starts turning on (target-offset mode); default 0 disables gating */
  settleRadiusPx?: number;
  /** Radius for snap-to-home during lock; default 0 disables */
  snapRadiusPx?: number;
  /** Speed threshold for snap-to-home during lock; default 0 disables */
  snapSpeedPxPerSec?: number;
  /** Per-scene target anchor override. Default uses global DotsCanvas anchor */
  targetAnchor?: "center" | "center-left" | "center-right" | "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right";
  /** Optional fixed Y offset applied when fitting SVG points */
  targetOffsetY?: number;
  /**
   * Scroll offset from the element's top where morphing to this SVG begins.
   * Can be negative to start before the element enters viewport.
   * Default: 0 (starts when element top reaches viewport top)
   */
  scrollStartOffset?: number;
  /** Content to render inside this scene section */
  children?: React.ReactNode;
  /** Additional class names for the section wrapper */
  className?: string;
  /** HTML tag to use for the wrapper */
  as?: "section" | "div" | "article";
}

/**
 * DotsScene defines a scroll-triggered SVG target for the DotsCanvas.
 * 
 * When the user scrolls through this component's area, the dots in the
 * parent DotsCanvas will morph to form the specified SVG shape.
 * 
 * @example
 * ```tsx
 * <DotsCanvas count={1200} colorAccent="#00A452">
 *   <DotsScene svgUrl="/assets/hero.svg" className="h-screen">
 *     <h1>Welcome</h1>
 *   </DotsScene>
 *   <DotsScene svgUrl="/assets/logo.svg" className="h-screen">
 *     <h2>Our Logo</h2>
 *   </DotsScene>
 * </DotsCanvas>
 * ```
 */
export default function DotsScene({
  svgUrl,
  scatter,
  disperse,
  dissipate,
  stiffnessMult = 1,
  dampingMult = 1,
  maxSpeedMult = 1,
  snapOnEnter = false,
  targetScale = 1,
  morphSpeedMult = 1,
  lockInMs = 0,
  homeSnapMs = 0,
  swayRampMs = 0,
  swayStyle = "force",
  settleRadiusPx = 0,
  snapRadiusPx = 0,
  snapSpeedPxPerSec = 0,
  targetAnchor,
  targetOffsetY,
  scrollStartOffset = 0,
  children,
  className,
  as: Component = "section",
}: DotsSceneProps) {
  const id = useId();
  const elementRef = useRef<HTMLElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const stopScrollContainerResizeRef = useRef<(() => void) | null>(null);
  const { registerScene, unregisterScene } = useDotsCanvas();

  const { mode, providerKey } = useMemo(() => {
    const requested: Array<DotTargetProvider["mode"]> = [];
    const dissipateResolved = Boolean(dissipate || disperse);
    if (svgUrl) requested.push("svg");
    if (scatter) requested.push("scatter");
    if (dissipateResolved) requested.push("dissipate");

    let resolved: DotTargetProvider["mode"] = "svg";
    // Scene-level mutual exclusivity: scatter > dissipate > svg.
    if (scatter) resolved = "scatter";
    else if (dissipateResolved) resolved = "dissipate";
    else if (svgUrl) resolved = "svg";

    if (requested.length > 1 && process.env.NODE_ENV !== "production") {
      console.warn(
        `[DotsScene] Multiple modes specified (${requested.join(
          ", "
        )}); using "${resolved}".`
      );
    }

    if (!svgUrl && !scatter && !dissipateResolved && process.env.NODE_ENV !== "production") {
      console.warn(
        `[DotsScene] No mode specified; set svgUrl, scatter, or dissipate. Defaulting to "scatter".`
      );
      resolved = "scatter";
    }

    const key =
      resolved === "svg"
        ? `svg:${svgUrl ?? ""}|scale:${targetScale}|anchor:${targetAnchor ?? "default"}|offsetY:${targetOffsetY ?? 0}`
        : resolved;

    return { mode: resolved, providerKey: key };
  }, [dissipate, disperse, scatter, svgUrl, targetScale, targetAnchor, targetOffsetY]);

  const provider: DotTargetProvider = useMemo(() => {
    if (mode === "scatter") {
      return {
        mode,
        getTargets: (w, h, dotCount) => generateScatterTargets(id, w, h, dotCount),
      };
    }
    if (mode === "dissipate") {
      return {
        mode,
        getTargets: (w, h, dotCount) =>
          generateDissipateTargets(id, w, h, dotCount),
      };
    }
    return {
      mode: "svg",
      getTargets: () => [],
    };
  }, [id, mode]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateMeasurements = () => {
      const scrollContainer = scrollContainerRef.current ?? getScrollContainer();
      const { elementTop, elementHeight } = measureElement(
        element as HTMLElement,
        scrollContainer
      );
      
      const scrollStart = elementTop + scrollStartOffset;
      const scrollEnd = elementTop + elementHeight;

      registerScene({
        id,
        scrollStart,
        scrollEnd,
        svgUrl,
        providerKey,
        provider,
        stiffnessMult,
        dampingMult,
        maxSpeedMult,
        snapOnEnter,
        targetScale,
        targetOffsetY,
        morphSpeedMult,
        lockInMs,
        homeSnapMs,
        swayRampMs,
        swayStyle,
        settleRadiusPx,
        snapRadiusPx,
        snapSpeedPxPerSec,
        targetAnchor,
      });
    };

    const scheduleUpdateMeasurements = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateMeasurements();
      });
    };

    const attachScrollContainer = (next: HTMLElement | null) => {
      if (scrollContainerRef.current === next) return;
      stopScrollContainerResizeRef.current?.();
      stopScrollContainerResizeRef.current = null;
      scrollContainerRef.current = next;
      if (next) {
        stopScrollContainerResizeRef.current = observeResize(next, () => {
          scheduleUpdateMeasurements();
        });
      }
      scheduleUpdateMeasurements();
    };

    // Initial measurement + observers
    attachScrollContainer(getScrollContainer());
    updateMeasurements();

    const onWindowResize = () => scheduleUpdateMeasurements();
    window.addEventListener("resize", onWindowResize);

    // Delayed re-measures to handle late layout shifts (fonts, async content)
    const timeout250 = window.setTimeout(scheduleUpdateMeasurements, 250);
    const timeout1200 = window.setTimeout(scheduleUpdateMeasurements, 1200);

    // Re-measure on element resize
    const stopElementResize = observeResize(element as HTMLElement, () => {
      scheduleUpdateMeasurements();
    });

    // Brief rAF poll to catch late scroll-container wiring (null -> element).
    let mounted = true;
    const pollStart = performance.now();
    const poll = () => {
      if (!mounted) return;
      if (performance.now() - pollStart > 2500) return;
      attachScrollContainer(getScrollContainer());
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);

    return () => {
      mounted = false;
      window.removeEventListener("resize", onWindowResize);
      window.clearTimeout(timeout250);
      window.clearTimeout(timeout1200);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      stopElementResize();
      stopScrollContainerResizeRef.current?.();
      stopScrollContainerResizeRef.current = null;
      unregisterScene(id);
    };
  }, [
    dampingMult,
    id,
    maxSpeedMult,
    provider,
    providerKey,
    registerScene,
    scrollStartOffset,
    snapOnEnter,
    morphSpeedMult,
    settleRadiusPx,
    snapRadiusPx,
    snapSpeedPxPerSec,
    stiffnessMult,
    swayRampMs,
    swayStyle,
    svgUrl,
    targetScale,
    targetAnchor,
    targetOffsetY,
    lockInMs,
    homeSnapMs,
    unregisterScene,
  ]);

  // Use callback ref to handle polymorphic component type safely
  const setRef = useCallback((el: HTMLDivElement | HTMLElement | null) => {
    (elementRef as React.MutableRefObject<HTMLElement | null>).current = el;
  }, []);

  return (
    <Component
      ref={setRef}
      className={className}
      data-dots-scene={id}
    >
      {children}
    </Component>
  );
}
