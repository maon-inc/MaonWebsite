/**
 * Scene component without state
 * This is a simple scene component that does not use the state engine.
 * It is used to render a scene without any state.
 */

"use client";

import React, { useEffect, useRef } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { clamp01 } from "@/motion/math";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";

type RangeMode = "enter-exit" | "top-top";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  mode?: RangeMode;
  offsetPx?: number;
  /**
   * Called on progress updates. Avoid heavy work here unless you need it.
   * Prefer reading CSS vars in CSS or doing your own canvas draw loop.
   */
  onProgress?: (p: number) => void;
  /**
   * Only write the CSS variable when it changes by at least this much.
   * Helps avoid excessive style writes.
   */
  epsilon?: number;
  /**
   * Optional: reduce update frequency (1 = every frame, 2 = every other frame).
   */
  everyNFrames?: number;
};

export default function SceneNoState({
  children,
  className,
  style,
  mode = "enter-exit",
  offsetPx = 0,
  onProgress,
  epsilon = 0.001,
  everyNFrames = 1,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let top = 0;
    let height = 1;
    let lastP = Number.NaN;
    let frame = 0;

    const recompute = () => {
      const m = measureElement(el, getScrollContainer());
      top = m.elementTop;
      height = Math.max(1, m.elementHeight);
    };

    recompute();
    const stopResize = observeResize(el, () => recompute());

    // Initialize var so CSS has a value immediately
    el.style.setProperty("--p", "0");

    const unsub = subscribe((s) => {
      frame++;
      if (everyNFrames > 1 && frame % everyNFrames !== 0) return;

      let start: number;
      let end: number;

      if (mode === "top-top") {
        start = top - offsetPx;
        end = top + height - offsetPx;
      } else {
        start = top - s.viewportH - offsetPx;
        end = top + height + offsetPx;
      }

      const p = clamp01((s.scrollY - start) / (end - start));

      if (Number.isNaN(lastP) || Math.abs(p - lastP) >= epsilon) {
        lastP = p;
        el.style.setProperty("--p", String(p));
        onProgress?.(p);
      }
    });

    return () => {
      stopResize();
      unsub();
    };
  }, [mode, offsetPx, onProgress, epsilon, everyNFrames]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
