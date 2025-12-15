/**
 * Scene component
 * This is a scene component that uses the state engine to track the scroll progress.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { getScrollContainer, subscribe } from "@/motion/engine";
import { clamp01 } from "@/motion/math";
import { measureElement } from "@/motion/measures";
import { observeResize } from "@/motion/observe";

type RangeMode = "enter-exit" | "top-top";

type Props = {
  children: React.ReactNode | ((p: number) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
  mode?: RangeMode;
  /**
   * Expands the scroll range by this many pixels on both ends.
   * Useful for easing in/out.
   */
  offsetPx?: number;
  /**
   * Optional: reduce update frequency (1 = every frame, 2 = every other frame).
   */
  everyNFrames?: number;
};

export default function Scene({
  children,
  className,
  style,
  mode = "enter-exit",
  offsetPx = 0,
  everyNFrames = 1,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let top = 0;
    let height = 1;
    let frame = 0;

    const recompute = () => {
      const m = measureElement(el, getScrollContainer());
      top = m.elementTop;
      height = Math.max(1, m.elementHeight);
    };

    recompute();
    const stopResize = observeResize(el, () => recompute());

    const unsub = subscribe((s) => {
      frame++;
      if (everyNFrames > 1 && frame % everyNFrames !== 0) return;

      let start: number;
      let end: number;

      if (mode === "top-top") {
        // 0 when element top hits viewport top, 1 when element bottom hits viewport top
        start = top - offsetPx;
        end = top + height - offsetPx;
      } else {
        // 0 when element enters viewport (bottom), 1 when it fully exits (top)
        start = top - s.viewportH - offsetPx;
        end = top + height + offsetPx;
      }

      const next = clamp01((s.scrollY - start) / (end - start));
      setP(next);
    });

    return () => {
      stopResize();
      unsub();
    };
  }, [mode, offsetPx, everyNFrames]);

  type SceneStyle = React.CSSProperties & { ["--p"]?: number };
  const mergedStyle: SceneStyle = {
    ...(style ?? {}),
    ["--p"]: p,
  };

  return (
    <div ref={ref} className={className} style={mergedStyle}>
      {typeof children === "function" ? (children as (p: number) => React.ReactNode)(p) : children}
    </div>
  );
}
