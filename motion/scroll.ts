/**
 * Scroll utilities
 * Functions for reading scroll values and computing velocity
 */

/**
 * @deprecated Use the scroll state from the motion engine's subscribe() instead.
 * This function doesn't respect custom scroll containers set via setScrollContainer().
 */
export function getScrollY(): number {
  return window.scrollY;
}

export function computeVelocity(
  current: number,
  previous: number,
  deltaTime: number
): number {
  if (deltaTime <= 0) return 0;
  return (current - previous) / deltaTime;
}

