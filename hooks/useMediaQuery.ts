"use client";

import { useState, useEffect } from "react";

/**
 * A hook that tracks whether a media query matches.
 * Handles SSR gracefully by returning false initially.
 * Includes legacy browser support for older Safari versions.
 *
 * @param query - The media query string (e.g., "(min-width: 768px)")
 * @returns Whether the media query currently matches
 *
 * @example
 * const isLargeScreen = useMediaQuery("(min-width: 1024px)");
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if matchMedia is available (SSR safety)
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mql = window.matchMedia(query);

    // Set initial value
    setMatches(mql.matches);

    // Create handler
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches("matches" in e ? e.matches : (e as MediaQueryList).matches);
    };

    // Add listener with legacy fallback for older browsers
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handleChange);
    } else {
      // Legacy API for older Safari
      (mql as unknown as { addListener?: (cb: (e: MediaQueryListEvent) => void) => void }).addListener?.(handleChange);
    }

    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", handleChange);
      } else {
        // Legacy API for older Safari
        (mql as unknown as { removeListener?: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener?.(handleChange);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
