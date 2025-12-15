/**
 * Measure utilities
 * Convert DOM element geometry into scroll ranges
 */

export interface ElementMeasure {
  elementTop: number;
  elementHeight: number;
}

export function measureElement(
  element: HTMLElement,
  scrollContainer?: HTMLElement | null
): ElementMeasure {
  const rect = element.getBoundingClientRect();

  if (!scrollContainer) {
    return {
      elementTop: rect.top + window.scrollY,
      elementHeight: rect.height,
    };
  }

  const rootRect = scrollContainer.getBoundingClientRect();
  const elementTop = rect.top - rootRect.top + scrollContainer.scrollTop;

  return {
    elementTop,
    elementHeight: rect.height,
  };
}
