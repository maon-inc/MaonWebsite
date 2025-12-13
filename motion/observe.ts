/**
 * Observer utilities
 * Thin wrappers around browser observers for invalidating measurements
 */

export function observeResize(
  element: HTMLElement,
  callback: (entries: ResizeObserverEntry[]) => void
): () => void {
  const observer = new ResizeObserver(callback);
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

