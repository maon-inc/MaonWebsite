"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * A convenience hook that returns true when the viewport is desktop-sized (768px+).
 * Uses the same breakpoint as Tailwind's `md:` prefix.
 *
 * @returns Whether the viewport is at least 768px wide
 *
 * @example
 * const isDesktop = useIsDesktop();
 * return isDesktop ? <DesktopNav /> : <MobileNav />;
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

export default useIsDesktop;
