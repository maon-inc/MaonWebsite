"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface CrossfadeTextProps<T> {
  /** Array of items to crossfade between */
  items: T[];
  /** Currently active item index */
  activeIndex: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Transition duration in milliseconds (default: 300) */
  transitionMs?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A component that crossfades between items with a smooth opacity transition.
 *
 * @example
 * <CrossfadeText
 *   items={steps}
 *   activeIndex={currentStep}
 *   renderItem={(step) => <p>{step.text}</p>}
 * />
 */
export function CrossfadeText<T>({
  items,
  activeIndex,
  renderItem,
  transitionMs = 300,
  className = "",
}: CrossfadeTextProps<T>) {
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
      }, transitionMs);
    }

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [activeIndex, displayIndex, transitionMs]);

  const item = items[displayIndex];
  if (!item) return null;

  return (
    <div
      className={className}
      style={{
        opacity,
        transition: `opacity ${transitionMs}ms ease-in-out`,
      }}
    >
      {renderItem(item, displayIndex)}
    </div>
  );
}

export default CrossfadeText;
