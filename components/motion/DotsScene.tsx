"use client";

import { useEffect, useRef, useId } from "react";
import { useDotsCanvas } from "./DotsCanvas";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";

interface DotsSceneProps {
  /** URL to the SVG file for this scene's dot formation */
  svgUrl: string;
  /** 
   * Scroll offset from the element's top where morphing to this SVG begins.
   * Can be negative to start before the element enters viewport.
   * Default: 0 (starts when element top reaches viewport top)
   */
  scrollStartOffset?: number;
  /**
   * Scroll offset from the element's top where morphing to this SVG completes.
   * Default: element height (completes when element bottom reaches viewport top)
   */
  scrollEndOffset?: number;
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
  scrollStartOffset = 0,
  scrollEndOffset,
  children,
  className,
  as: Component = "section",
}: DotsSceneProps) {
  const id = useId();
  const elementRef = useRef<HTMLElement>(null);
  const { registerScene, unregisterScene } = useDotsCanvas();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateMeasurements = () => {
      const { elementTop, elementHeight } = measureElement(element as HTMLElement);
      
      const scrollStart = elementTop + scrollStartOffset;
      const scrollEnd = scrollEndOffset !== undefined 
        ? elementTop + scrollEndOffset 
        : elementTop + elementHeight;

      registerScene({
        id,
        svgUrl,
        scrollStart,
        scrollEnd,
      });
    };

    // Initial measurement
    updateMeasurements();

    // Re-measure on resize
    const stopResize = observeResize(element as HTMLElement, updateMeasurements);

    // Re-measure on window resize
    const handleResize = () => updateMeasurements();
    window.addEventListener("resize", handleResize);

    return () => {
      stopResize();
      window.removeEventListener("resize", handleResize);
      unregisterScene(id);
    };
  }, [id, svgUrl, scrollStartOffset, scrollEndOffset, registerScene, unregisterScene]);

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