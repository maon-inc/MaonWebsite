/**
 * Type definitions for the dots animation system
 */

import type { Point } from "@/lib/motion/svgSample";

// Re-export Point for convenience
export type { Point };

/**
 * A single animated dot in the particle system
 */
export interface Dot {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  startPos: { x: number; y: number };
  radius: number;
  baseStiffness: number;
  baseDamping: number;
  baseNoiseAmp: number;
  noiseFreq: number;
  seedA: number;
  seedB: number;
  swayPhase: number;
  swayAmp: number;
  coordinatedPhase: boolean;
}

/**
 * Target anchor positions for positioning the dot target area
 */
export type TargetAnchor =
  | "center"
  | "center-left"
  | "center-right"
  | "top-center"
  | "top-left"
  | "top-right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "right-center";

/**
 * Provider for dot target positions
 */
export interface DotTargetProvider {
  mode: "svg" | "scatter" | "dissipate";
  getTargets: (
    canvasWidth: number,
    canvasHeight: number,
    dotCount: number
  ) => Promise<Point[]> | Point[];
}

/**
 * Configuration for a single scene in the dots animation
 */
export interface SceneConfig {
  id: string;
  scrollStart: number;
  scrollEnd: number;
  svgUrl?: string;
  providerKey: string;
  provider: DotTargetProvider;
  order: number;
  stiffnessMult: number;
  dampingMult: number;
  maxSpeedMult: number;
  snapOnEnter: boolean;
  targetScale: number;
  targetAnchor?: TargetAnchor;
  targetOffsetY?: number;
  lockInMs: number;
  homeSnapMs: number;
  swayRampMs: number;
  swayStyle: "force" | "targetOffset";
  settleRadiusPx: number;
  snapRadiusPx: number;
  snapSpeedPxPerSec: number;
  morphSpeedMult: number;
}

/**
 * Scene config without the order field (for registration input)
 */
export type SceneConfigInput = Omit<SceneConfig, "order">;

/**
 * Result of blending targets between scenes
 */
export interface TargetBlend {
  from: Point[];
  to: Point[] | null;
  t: number;
  mode: DotTargetProvider["mode"];
  activeSceneId: string;
}

/**
 * Retarget mode for SVG transitions
 */
export type RetargetMode = "soft" | "snap";

/**
 * Options for retargeting dots to a new SVG
 */
export interface RetargetOpts {
  burstMs?: number;
  stiffnessMult?: number;
  dampingMult?: number;
  maxSpeedMult?: number;
}

/**
 * Animation phase
 */
export type AnimationPhase = "initial" | "transition" | "scrolling";

/**
 * RGB color representation
 */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Mode-specific physics parameters
 */
export interface ModeParams {
  stiffnessMult: number;
  noiseMult: number;
  jitterMult: number;
}

/**
 * Mode transition state
 */
export interface ModeTransition {
  from: DotTargetProvider["mode"];
  to: DotTargetProvider["mode"];
  startTimeMs: number;
}
