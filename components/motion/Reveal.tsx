/**
 * Reveal component
 * This is a reveal component that uses the IntersectionObserver to detect when an element is in view.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { observeIntersection } from "@/motion/observe";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** CSS class applied when revealed */
  revealedClassName?: string;
  /** IntersectionObserver options */
  rootMargin?: string;
  threshold?: number;
  /** If true, it can hide again when leaving viewport */
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  style,
  revealedClassName = "is-revealed",
  rootMargin = "0px 0px -10% 0px",
  threshold = 0.1,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanup = observeIntersection(
      el,
      (isIntersecting) => {
        if (isIntersecting) setRevealed(true);
        else if (!once) setRevealed(false);
      },
      { rootMargin, threshold }
    );

    return cleanup;
  }, [rootMargin, threshold, once]);

  return (
    <div
      ref={ref}
      className={[
        className ?? "",
        revealed ? revealedClassName : "",
      ].join(" ").trim()}
      style={style}
      data-revealed={revealed ? "true" : "false"}
    >
      {children}
    </div>
  );
}
