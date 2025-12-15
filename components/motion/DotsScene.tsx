"use client";

import { useEffect, useMemo, useRef, useId } from "react";
import { useDotsCanvas, type DotTargetProvider } from "./DotsCanvas";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";
import { getScrollContainer } from "@/motion/engine";
import { generateDissipateTargets, generateScatterTargets } from "./dotsTargets";

interface DotsSceneProps {
  /** URL to the SVG file for this scene's dot formation */
  svgUrl?: string;
  scatter?: boolean;
  dissipate?: boolean;
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
  dissipate,
  scrollStartOffset = 0,
  children,
  className,
  as: Component = "section",
}: DotsSceneProps) {
  const id = useId();
  const elementRef = useRef<HTMLElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const { registerScene, unregisterScene } = useDotsCanvas();

  const { mode, providerKey } = useMemo(() => {
    const requested: Array<DotTargetProvider["mode"]> = [];
    if (svgUrl) requested.push("svg");
    if (scatter) requested.push("scatter");
    if (dissipate) requested.push("dissipate");

    let resolved: DotTargetProvider["mode"] = "svg";
    if (dissipate) resolved = "dissipate";
    else if (scatter) resolved = "scatter";
    else if (svgUrl) resolved = "svg";

    if (requested.length > 1 && process.env.NODE_ENV !== "production") {
      console.warn(
        `[DotsScene] Multiple modes specified (${requested.join(
          ", "
        )}); using "${resolved}".`
      );
    }

    if (!svgUrl && !scatter && !dissipate && process.env.NODE_ENV !== "production") {
      console.warn(
        `[DotsScene] No mode specified; set svgUrl, scatter, or dissipate. Defaulting to "scatter".`
      );
      resolved = "scatter";
    }

    const key =
      resolved === "svg" ? `svg:${svgUrl ?? ""}` : resolved;

    return { mode: resolved, providerKey: key };
  }, [dissipate, scatter, svgUrl]);

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
      const { elementTop, elementHeight } = measureElement(
        element as HTMLElement,
        getScrollContainer()
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
      });
    };

    const scheduleUpdateMeasurements = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateMeasurements();
      });
    };

    // Initial measurement
    updateMeasurements();

    // Delayed re-measures to handle late layout shifts (fonts, async content)
    const timeout250 = window.setTimeout(scheduleUpdateMeasurements, 250);
    const timeout1200 = window.setTimeout(scheduleUpdateMeasurements, 1200);

    // Re-measure on resize
    const stopElementResize = observeResize(element as HTMLElement, () => {
      scheduleUpdateMeasurements();
    });

    const scrollContainer = getScrollContainer();
    const stopScrollContainerResize = scrollContainer
      ? observeResize(scrollContainer, () => {
          scheduleUpdateMeasurements();
        })
      : null;

    const stopRootResize = observeResize(document.documentElement, () => {
      scheduleUpdateMeasurements();
    });

    // If the scroll container isn't set yet, the document root observer serves
    // as a fallback for viewport/layout changes.

    return () => {
      window.clearTimeout(timeout250);
      window.clearTimeout(timeout1200);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      stopElementResize();
      stopScrollContainerResize?.();
      stopRootResize();
      unregisterScene(id);
    };
  }, [id, provider, providerKey, registerScene, scrollStartOffset, svgUrl, unregisterScene]);

  return (
    <Component
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      data-dots-scene={id}
    >
      {children}
    </Component>
  );
}
