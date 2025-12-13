/**
 * Measure utilities
 * Convert DOM element geometry into scroll ranges
 */

export interface ElementMeasure {
  elementTop: number;
  elementHeight: number;
}

export function measureElement(element: HTMLElement): ElementMeasure {
  const rect = element.getBoundingClientRect();
  return {
    elementTop: rect.top + window.scrollY,
    elementHeight: rect.height,
  };
}

