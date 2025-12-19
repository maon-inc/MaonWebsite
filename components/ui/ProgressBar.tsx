"use client";

import { forwardRef } from "react";

export interface ProgressBarProps {
  /** Label text displayed in the progress bar */
  label: string;
  /** Number of clickable segments */
  segments: number;
  /** Callback when a segment is clicked */
  onSegmentClick?: (index: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Progress fill color (default: #97CEE7) */
  fillColor?: string;
}

/**
 * A progress bar component with clickable segments.
 * Use the ref to directly update the progress width for smooth animations.
 *
 * @example
 * const progressRef = useRef<HTMLDivElement>(null);
 *
 * // Update progress directly via DOM for smooth animation
 * progressRef.current.style.width = `${progress * 100}%`;
 *
 * <ProgressBar
 *   ref={progressRef}
 *   label="PROGRESS"
 *   segments={4}
 *   onSegmentClick={(i) => scrollToStep(i)}
 * />
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    {
      label,
      segments,
      onSegmentClick,
      className = "",
      fillColor = "#97CEE7",
    },
    ref
  ) {
    return (
      <div
        className={`rounded-[10px] px-8 py-2 whitespace-nowrap overflow-hidden relative ${className}`}
        style={{ border: "0.9px solid black" }}
      >
        {/* Progress fill */}
        <div
          ref={ref}
          className="absolute inset-0 rounded-[10px]"
          style={{
            backgroundColor: fillColor,
            width: "0%",
            willChange: "width",
          }}
        />
        {/* Segment dividers */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[10px] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, rgba(0,0,0,0.35), rgba(0,0,0,0.35) 1px, transparent 1px, transparent)",
            backgroundSize: `calc(100% / ${segments}) 100%`,
            opacity: 0.35,
          }}
        />
        {/* Clickable segments */}
        {onSegmentClick && (
          <div
            className="absolute inset-0 z-30 grid"
            style={{
              gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))`,
              touchAction: "manipulation",
            }}
          >
            {Array.from({ length: segments }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSegmentClick(i);
                }}
                className="h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/60"
                style={{ touchAction: "manipulation" }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        )}
        <p className="relative text-[14px] font-[var(--font-sans)]">{label}</p>
      </div>
    );
  }
);

export default ProgressBar;
