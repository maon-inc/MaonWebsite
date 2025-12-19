/**
 * Observer utilities
 * Thin wrappers around browser observers for invalidating measurements
 */

export interface ObserveResizeOptions {
  /**
   * Throttle time in milliseconds. If provided, callbacks are rate-limited
   * using trailing-edge throttle (callback fires at end of throttle window).
   * Useful for heavy resize handlers to avoid excessive recomputation.
   */
  throttleMs?: number;
}

export function observeResize(
  element: HTMLElement,
  callback: (entries: ResizeObserverEntry[]) => void,
  options?: ObserveResizeOptions
): () => void {
  const { throttleMs } = options ?? {};

  let wrappedCallback = callback;

  if (throttleMs && throttleMs > 0) {
    let lastCall = 0;
    let pendingEntries: ResizeObserverEntry[] | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    wrappedCallback = (entries: ResizeObserverEntry[]) => {
      const now = Date.now();
      const elapsed = now - lastCall;

      if (elapsed >= throttleMs) {
        // Enough time has passed, fire immediately
        lastCall = now;
        callback(entries);
      } else {
        // Still within throttle window, schedule trailing call
        pendingEntries = entries;
        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            timeoutId = null;
            lastCall = Date.now();
            if (pendingEntries) {
              callback(pendingEntries);
              pendingEntries = null;
            }
          }, throttleMs - elapsed);
        }
      }
    };
  }

  const observer = new ResizeObserver(wrappedCallback);
  observer.observe(element);
  return () => observer.disconnect();
}

export function observeIntersection(
  element: HTMLElement,
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      callback(entry.isIntersecting);
    });
  }, options);
  observer.observe(element);
  return () => observer.disconnect();
}

