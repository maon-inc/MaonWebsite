/**
 * Utility functions for the dots animation system
 */

import type { Point, TargetAnchor, RgbColor } from "./types";

// ============================================================================
// Random Number Generation
// ============================================================================

/**
 * Generate a seeded random number (0-1) from a seed value
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Hash a string to a numeric seed for deterministic randomness
 */
export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Create a Mulberry32 PRNG from a seed
 */
export function makeMulberry32(seed: number): () => number {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// Geometry & Layout
// ============================================================================

/**
 * Calculate the offset needed to position content at a specific anchor point
 */
export function calculateTargetOffset(
  canvasWidth: number,
  canvasHeight: number,
  targetWidth: number,
  targetHeight: number,
  anchor: TargetAnchor
): { offsetX: number; offsetY: number } {
  let offsetX = 0;
  let offsetY = 0;

  // Horizontal
  if (anchor === "right-center") {
    // Position on the right side with some margin from edge
    offsetX = canvasWidth - targetWidth - canvasWidth * 0.15;
  } else if (anchor.includes("left")) {
    offsetX = 0;
  } else if (anchor.includes("right")) {
    offsetX = canvasWidth - targetWidth;
    // Move bottom-right slightly more to the left
    if (anchor === "bottom-right") {
      offsetX -= canvasWidth * 0.1; // 10% of canvas width to the left
    }
  } else {
    offsetX = (canvasWidth - targetWidth) / 2;
  }

  // Vertical
  if (anchor === "right-center") {
    // Vertically centered
    offsetY = (canvasHeight - targetHeight) / 2;
  } else if (anchor === "top-center") {
    // Center in upper portion, leaving room for bottom text
    const upperRegion = canvasHeight * 0.75;
    offsetY = (upperRegion - targetHeight) / 2;
    // Bring down slightly
    offsetY += canvasHeight * 0.005;
    offsetY = Math.max(30, offsetY);
  } else if (anchor.includes("top")) {
    offsetY = 0;
  } else if (anchor.includes("bottom")) {
    // Position lower by adding offset below canvas bottom
    offsetY = canvasHeight - targetHeight + canvasHeight * 0.08;
  } else if (anchor === "center") {
    // Center with slight downward offset
    offsetY = (canvasHeight - targetHeight) / 2 + canvasHeight * 0.005;
  } else {
    offsetY = (canvasHeight - targetHeight) / 2;
  }

  return { offsetX, offsetY };
}

/**
 * Generate fallback points in a spiral pattern when SVG loading fails
 */
export function generateFallbackPoints(
  count: number,
  width: number,
  height: number
): Point[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;
  const points: Point[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const spiralRadius = radius * (0.3 + (i / count) * 0.7);
    points.push({
      x: centerX + Math.cos(angle) * spiralRadius,
      y: centerY + Math.sin(angle) * spiralRadius,
    });
  }

  return points;
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Parse a hex color string to RGB values
 */
export function hexToRgb(hex: string): RgbColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 161, g: 161, b: 170 }; // Default gray
}

/**
 * Get a CSS custom property value from :root.
 * Returns the fallback if the variable is not defined or we're in SSR.
 */
export function getCssVariable(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/**
 * Create a color lookup table for smooth gradient transitions
 * @param gray - Starting color (dots far from home)
 * @param accent - Ending color (dots settled at home)
 * @param steps - Number of entries in the LUT (default: 256)
 */
export function createColorLUT(
  gray: RgbColor,
  accent: RgbColor,
  steps: number = 256
): string[] {
  const lut: string[] = new Array(steps);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(gray.r + (accent.r - gray.r) * t);
    const g = Math.round(gray.g + (accent.g - gray.g) * t);
    const b = Math.round(gray.b + (accent.b - gray.b) * t);
    lut[i] = `rgb(${r},${g},${b})`;
  }
  return lut;
}

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Cubic ease in-out
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Quadratic ease out
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Custom ease out with power 1.8
 */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 1.8);
}

// ============================================================================
// Noise Generation
// ============================================================================

/**
 * Generate 2D noise values for organic movement
 * Note: Returns a new object each call - consider inlining in hot loops
 */
export function generateNoise(
  t: number,
  seedA: number,
  seedB: number
): { x: number; y: number } {
  return {
    x: Math.sin(t * seedA + seedB) * Math.cos(t * seedB * 0.7),
    y: Math.cos(t * seedA * 0.8 + seedB) * Math.sin(t * seedB),
  };
}

// ============================================================================
// Physics Constants
// ============================================================================

/**
 * Mode-specific physics parameters
 */
export const MODE_PARAMS = {
  svg: { stiffnessMult: 1, noiseMult: 1, jitterMult: 0 },
  scatter: { stiffnessMult: 0.22, noiseMult: 2.2, jitterMult: 0.35 },
  dissipate: { stiffnessMult: 2.4, noiseMult: 0.15, jitterMult: 0 },
} as const;

/**
 * Duration of mode transitions in milliseconds
 */
export const MODE_TRANSITION_MS = 450;

/**
 * Base maximum speed for dots in pixels per second
 */
export const BASE_MAX_SPEED_PX_PER_S = 1600;

/**
 * Duration of the "snap on enter" burst effect
 */
export const SNAP_ON_ENTER_BURST_MS = 120;

/**
 * Maximum multiplier for burst effects (prevents explosive movements)
 */
export const BURST_MAX_MULT = 1.6;

/**
 * Minimum damping multiplier during bursts (prevents over-dampening)
 */
export const BURST_MIN_DAMPING_MULT = 0.95;

/**
 * Blend distance in pixels for smooth scene transitions
 */
export const BLEND_PX = 140;
