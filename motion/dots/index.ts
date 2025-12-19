/**
 * Dots Animation System
 *
 * This module provides types and utilities for the particle animation system.
 * The main DotsCanvas component uses these for its physics simulation and rendering.
 *
 * @example
 * import { Dot, TargetAnchor, MODE_PARAMS } from "@/motion/dots";
 */

// Types
export type {
  Point,
  Dot,
  TargetAnchor,
  DotTargetProvider,
  SceneConfig,
  SceneConfigInput,
  TargetBlend,
  RetargetMode,
  RetargetOpts,
  AnimationPhase,
  RgbColor,
  ModeParams,
  ModeTransition,
} from "./types";

// Utilities
export {
  // Random
  seededRandom,
  hashStringToSeed,
  makeMulberry32,
  // Geometry
  calculateTargetOffset,
  generateFallbackPoints,
  // Color
  hexToRgb,
  getCssVariable,
  createColorLUT,
  // Easing
  easeInOutCubic,
  easeOutQuad,
  easeOut,
  // Noise
  generateNoise,
  // Constants
  MODE_PARAMS,
  MODE_TRANSITION_MS,
  BASE_MAX_SPEED_PX_PER_S,
  SNAP_ON_ENTER_BURST_MS,
  BURST_MAX_MULT,
  BURST_MIN_DAMPING_MULT,
  BLEND_PX,
} from "./utils";
