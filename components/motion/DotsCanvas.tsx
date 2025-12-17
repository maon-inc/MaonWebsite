"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  getCachedFittedSvgPoints,
  clearSvgCaches,
  type Point,
} from "@/lib/motion/svgSample";
import { subscribe, reset as resetEngine } from "@/motion/engine";
import { clamp01, lerp } from "@/motion/math";
import { observeResize } from "@/motion/observe";
import {
  hashStringToSeed,
  makeMulberry32,
} from "./dotsTargets";

// ============================================================================
// Types
// ============================================================================

interface SceneConfig {
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

type SceneConfigInput = Omit<SceneConfig, "order">;

interface DotsCanvasContextValue {
  registerScene: (config: SceneConfigInput) => void;
  unregisterScene: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

interface Dot {
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

export type DotTargetProvider = {
  mode: "svg" | "scatter" | "dissipate";
  getTargets: (
    canvasWidth: number,
    canvasHeight: number,
    dotCount: number
  ) => Promise<Point[]> | Point[];
};

type TargetAnchor =
  | "center"
  | "center-left"
  | "center-right"
  | "top-center"
  | "top-left"
  | "top-right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right";

interface DotsCanvasProps {
  children: ReactNode;
  count?: number;
  dotRadius?: number;
  targetWidth?: number;
  targetHeight?: number;
  targetAnchor?: TargetAnchor;
  className?: string;
  /** Duration of initial convergence animation in ms (default: 5000) */
  initialDurationMs?: number;
  /** Duration of transition to breathing phase in ms (default: 1500) */
  transitionDurationMs?: number;
  /** How quickly dots follow scroll morphing (0-1, higher = snappier, default: 0.25) */
  morphSpeed?: number;
  /** Gray color when dots are far from home (default: reads from --dots-color-gray CSS variable) */
  colorGray?: string;
  /** Accent color when dots are settled (default: reads from --dots-color-accent CSS variable) */
  colorAccent?: string;
}

// ============================================================================
// Context
// ============================================================================

const DotsCanvasContext = createContext<DotsCanvasContextValue | null>(null);

export function useDotsCanvas() {
  const ctx = useContext(DotsCanvasContext);
  if (!ctx) {
    throw new Error("useDotsCanvas must be used within a DotsCanvas");
  }
  return ctx;
}

type RetargetMode = "soft" | "snap";

type RetargetOpts = {
  burstMs?: number;
  stiffnessMult?: number;
  dampingMult?: number;
  maxSpeedMult?: number;
};

// Track all mounted DotsCanvas instances for proper multi-instance support
type RetargetFn = (svgUrl: string, mode: RetargetMode, opts?: RetargetOpts) => void;
const mountedCanvasInstances = new Set<RetargetFn>();

export function retargetToSvg(
  svgUrl: string,
  mode: RetargetMode = "soft",
  opts?: RetargetOpts
): void {
  // Call retarget on all mounted instances (typically just one)
  for (const fn of mountedCanvasInstances) {
    fn(svgUrl, mode, opts);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateNoise(
  t: number,
  seedA: number,
  seedB: number
): { x: number; y: number } {
  return {
    x: Math.sin(t * seedA + seedB) * Math.cos(t * seedB * 0.7),
    y: Math.cos(t * seedA * 0.8 + seedB) * Math.sin(t * seedB),
  };
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function calculateTargetOffset(
  canvasWidth: number,
  canvasHeight: number,
  targetWidth: number,
  targetHeight: number,
  anchor: TargetAnchor
): { offsetX: number; offsetY: number } {
  let offsetX = 0;
  let offsetY = 0;

  // Horizontal
  if (anchor.includes("left")) {
    offsetX = 0;
  } else if (anchor.includes("right")) {
    offsetX = canvasWidth - targetWidth;
    // Move bottom-right slightly more to the left
    if (anchor === "bottom-right") {
      offsetX -= canvasWidth * 0.10; // 5% of canvas width to the left
    }
  } else {
    offsetX = (canvasWidth - targetWidth) / 2;
  }

  // Vertical
  if (anchor === "top-center") {
    // Center in upper portion, leaving room for bottom text
    const upperRegion = canvasHeight * 0.75;
    offsetY = (upperRegion - targetHeight) / 2;
    // Bring down slightly
    offsetY += canvasHeight * 0.01;
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

function generateFallbackPoints(
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 161, g: 161, b: 170 };
}

/**
 * Get a CSS custom property value from :root.
 * Returns the fallback if the variable is not defined or we're in SSR.
 */
function getCssVariable(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

// ============================================================================
// Easing Functions
// ============================================================================

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 1.8);
}

const MODE_PARAMS: Record<
  DotTargetProvider["mode"],
  { stiffnessMult: number; noiseMult: number; jitterMult: number }
> = {
  svg: { stiffnessMult: 1, noiseMult: 1, jitterMult: 0 },
  scatter: { stiffnessMult: 0.22, noiseMult: 2.2, jitterMult: 0.35 },
  dissipate: { stiffnessMult: 2.4, noiseMult: 0.15, jitterMult: 0 },
};

const MODE_TRANSITION_MS = 450;
const BASE_MAX_SPEED_PX_PER_S = 1600;
const SNAP_ON_ENTER_BURST_MS = 200;

// ============================================================================
// DotsCanvas Component
// ============================================================================

export default function DotsCanvas({
  children,
  count = 1200,
  dotRadius = 1.8,
  targetWidth = 500,
  targetHeight = 500,
  targetAnchor = "center",
  className,
  initialDurationMs = 5000,
  transitionDurationMs = 1500,
  morphSpeed = 0.25,
  colorGray,
  colorAccent,
}: DotsCanvasProps) {
  // CSS variable fallbacks (hardcoded for SSR, will be overwritten on mount)
  const CSS_FALLBACK_GRAY = "#A1A1AA";
  const CSS_FALLBACK_ACCENT = "#00A452";
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const resizeRafRef = useRef<number | null>(null);
  const needsReinitRef = useRef(true);
  const lastCountRef = useRef<number>(count);
  const scenesRef = useRef<Map<string, SceneConfig>>(new Map());
  const sceneTargetsRef = useRef<Map<string, Point[]>>(new Map());
  const targetsCacheRef = useRef<Map<string, { key: string; targets: Point[] }>>(
    new Map()
  );
  const sortedScenesRef = useRef<SceneConfig[]>([]);
  const sceneOrderCounterRef = useRef(0);
  const sceneOrderRef = useRef<Map<string, number>>(new Map());
  const currentHomeRef = useRef<Point[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const phaseRef = useRef<"initial" | "transition" | "scrolling">("initial");
  const initialProgressRef = useRef<number>(0);
  const transitionProgressRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const engineTimeMsRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef(false);
  const activeModeRef = useRef<DotTargetProvider["mode"]>("svg");
  const activeSceneIdRef = useRef<string | null>(null);
  const dissipateImpulseKeyRef = useRef<string | null>(null);
  const dissipateBurstUntilRef = useRef<number>(0);
  const modeTransitionRef = useRef<{
    from: DotTargetProvider["mode"];
    to: DotTargetProvider["mode"];
    startTimeMs: number;
  } | null>(null);
  const retargetBoostUntilRef = useRef<number>(0);
  const retargetBoostFactorRef = useRef<number>(1);
  const forceHomeSnapUntilRef = useRef<number>(0);
  const burstUntilRef = useRef<number>(0);
  const burstSceneIdRef = useRef<string | null>(null);
  const burstStiffnessMultRef = useRef<number>(1);
  const burstDampingMultRef = useRef<number>(1);
  const burstMaxSpeedMultRef = useRef<number>(1);
  const pendingRetargetRef = useRef<{ svgUrl: string; mode: RetargetMode } | null>(
    null
  );
  const pendingResizeSnapRef = useRef(false);
  const targetsLoadSeqRef = useRef(0);
  const targetsLoadingRef = useRef(false);
  const lastActiveControllerIdRef = useRef<string | null>(null);
  const lastActiveProviderKeyRef = useRef<string | null>(null);
  const lockUntilRef = useRef<number>(0);
  const lockSceneIdRef = useRef<string | null>(null);
  const lockStartRef = useRef<number>(0);

  // Pre-parse colors (use fallbacks for initial SSR render)
  const grayRgbRef = useRef(hexToRgb(colorGray ?? CSS_FALLBACK_GRAY));
  const accentRgbRef = useRef(hexToRgb(colorAccent ?? CSS_FALLBACK_ACCENT));

  // State
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scenesVersion, setScenesVersion] = useState(0);

  // Resolve colors from CSS variables on mount, then update when props change
  useEffect(() => {
    const resolvedGray = colorGray ?? getCssVariable("--dots-color-gray", CSS_FALLBACK_GRAY);
    const resolvedAccent = colorAccent ?? getCssVariable("--dots-color-accent", CSS_FALLBACK_ACCENT);
    grayRgbRef.current = hexToRgb(resolvedGray);
    accentRgbRef.current = hexToRgb(resolvedAccent);
  }, [colorGray, colorAccent]);

  // -------------------------------------------------------------------------
  // Canvas Setup
  // -------------------------------------------------------------------------

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width === 0 || height === 0) return undefined;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    setCanvasSize({ width, height });
    return { width, height, dpr };
  }, []);

  // -------------------------------------------------------------------------
  // SVG Targets (cached parse + sample + fit)
  // -------------------------------------------------------------------------

  const getSvgTargets = useCallback(
    async (
      svgUrl: string,
      canvasWidth: number,
      canvasHeight: number,
      dotCount: number,
      targetScale: number = 1,
      sceneAnchor?: TargetAnchor,
      targetOffsetY?: number
    ): Promise<Point[]> => {
      const fitW = targetWidth * targetScale;
      const fitH = targetHeight * targetScale;
      const anchor = sceneAnchor ?? targetAnchor;
      const { offsetX, offsetY } = calculateTargetOffset(
        canvasWidth,
        canvasHeight,
        fitW,
        fitH,
        anchor
      );
      const finalOffsetY = offsetY + (targetOffsetY ?? 0);

      try {
        return await getCachedFittedSvgPoints({
          svgUrl,
          count: dotCount,
          fitWidth: fitW,
          fitHeight: fitH,
          paddingPx: 0,
          offsetX,
          offsetY: finalOffsetY,
        });
      } catch (error) {
        console.warn(`Failed to load SVG ${svgUrl}, using fallback:`, error);
        const fallbackPoints = generateFallbackPoints(
          dotCount,
          fitW,
          fitH
        );
        return fallbackPoints.map((p) => ({
          x: p.x + offsetX,
          y: p.y + finalOffsetY,
        }));
      }
    },
    [targetAnchor, targetHeight, targetWidth]
  );

  // -------------------------------------------------------------------------
  // Scene Registration
  // -------------------------------------------------------------------------

  const registerScene = useCallback((config: SceneConfigInput) => {
    const prev = scenesRef.current.get(config.id);

    const fieldsEqual =
      prev &&
      prev.scrollStart === config.scrollStart &&
      prev.scrollEnd === config.scrollEnd &&
      prev.svgUrl === config.svgUrl &&
      prev.providerKey === config.providerKey &&
      prev.provider.mode === config.provider.mode &&
      prev.stiffnessMult === config.stiffnessMult &&
      prev.dampingMult === config.dampingMult &&
      prev.maxSpeedMult === config.maxSpeedMult &&
      prev.snapOnEnter === config.snapOnEnter &&
      prev.targetScale === config.targetScale &&
      prev.targetAnchor === config.targetAnchor &&
      prev.targetOffsetY === config.targetOffsetY &&
      prev.lockInMs === config.lockInMs &&
      prev.homeSnapMs === config.homeSnapMs &&
      prev.swayRampMs === config.swayRampMs &&
      prev.swayStyle === config.swayStyle &&
      prev.settleRadiusPx === config.settleRadiusPx &&
      prev.snapRadiusPx === config.snapRadiusPx &&
      prev.snapSpeedPxPerSec === config.snapSpeedPxPerSec &&
      prev.morphSpeedMult === config.morphSpeedMult;

    if (fieldsEqual) {
      return;
    }

    let order = sceneOrderRef.current.get(config.id);
    if (order === undefined) {
      order = ++sceneOrderCounterRef.current;
      sceneOrderRef.current.set(config.id, order);
    }

    scenesRef.current.set(config.id, { ...config, order });

    sortedScenesRef.current = Array.from(scenesRef.current.values()).sort(
      (a, b) => a.scrollStart - b.scrollStart || a.order - b.order
    );

    if (prev && prev.providerKey !== config.providerKey) {
      sceneTargetsRef.current.delete(config.id);
      targetsCacheRef.current.delete(config.id);
    }

    setScenesVersion((v) => v + 1);
  }, []);

  const unregisterScene = useCallback((id: string) => {
    scenesRef.current.delete(id);
    sceneTargetsRef.current.delete(id);
    targetsCacheRef.current.delete(id);
    sceneOrderRef.current.delete(id);
    sortedScenesRef.current = Array.from(scenesRef.current.values()).sort(
      (a, b) => a.scrollStart - b.scrollStart || a.order - b.order
    );
    setScenesVersion((v) => v + 1);
  }, []);

  // -------------------------------------------------------------------------
  // Load All Scene Targets
  // -------------------------------------------------------------------------

  const loadAllSceneTargets = useCallback(async () => {
    const seq = ++targetsLoadSeqRef.current;
    targetsLoadingRef.current = true;
    try {
      const scenes = sortedScenesRef.current;
      if (scenes.length === 0 || canvasSize.width === 0) return;

      const w = canvasSize.width;
      const h = canvasSize.height;
      const dotCount = count;
      const globalKey = `${w}x${h}|dots:${dotCount}|tw:${targetWidth}|th:${targetHeight}|ta:${targetAnchor}`;

      const loadPromises = scenes.map(async (scene) => {
        const cacheKey = `${scene.providerKey}|${globalKey}`;
        const cached = targetsCacheRef.current.get(scene.id);
        if (cached?.key === cacheKey) {
          if (seq !== targetsLoadSeqRef.current) return;
          sceneTargetsRef.current.set(scene.id, cached.targets);
          return;
        }

        let targets: Point[];

        if (scene.provider.mode === "svg") {
          if (!scene.svgUrl) {
            throw new Error(`DotsCanvas: svg scene "${scene.id}" missing svgUrl`);
          }
          targets = await getSvgTargets(
            scene.svgUrl,
            w,
            h,
            dotCount,
            scene.targetScale,
            scene.targetAnchor,
            scene.targetOffsetY
          );
        } else {
          const maybe = scene.provider.getTargets(w, h, dotCount);
          targets = maybe instanceof Promise ? await maybe : maybe;
        }

        if (seq !== targetsLoadSeqRef.current) return;
        targetsCacheRef.current.set(scene.id, { key: cacheKey, targets });
        sceneTargetsRef.current.set(scene.id, targets);
      });

      await Promise.all(loadPromises);
    } finally {
      if (seq === targetsLoadSeqRef.current) {
        targetsLoadingRef.current = false;
      }
    }
  }, [canvasSize, count, getSvgTargets, targetAnchor, targetHeight, targetWidth]);

  // -------------------------------------------------------------------------
  // Initialize Dots
  // -------------------------------------------------------------------------

  const initializeDots = useCallback(
    (width: number, height: number) => {
      const dots: Dot[] = [];

      for (let i = 0; i < count; i++) {
        const seed = i * 7919 + 12345;
        const r1 = seededRandom(seed);
        const r2 = seededRandom(seed + 1);
        const r3 = seededRandom(seed + 2);
        const r4 = seededRandom(seed + 3);
        const r5 = seededRandom(seed + 4);
        const r6 = seededRandom(seed + 5);
        const r7 = seededRandom(seed + 6);
        const r8 = seededRandom(seed + 7);
        const r9 = seededRandom(seed + 9);

        const radiusVariation = 0.6 + r3 * 0.8;
        const swayPhase = r8 * Math.PI * 2;
        const swayAmp = 3.5 + r9 * 2.5;

        const startX = r1 * width;
        const startY = r2 * height;

        const coordinatedPhase = i % 4 < 3;

        const profileType = i % 10;
        let baseStiffness: number;
        let baseDamping: number;
        let baseNoiseAmp: number;
        let noiseFreq: number;

        if (profileType < 7) {
          baseStiffness = 4.0 + r4 * 3.0;
          baseDamping = 0.92 + r5 * 0.03;
          baseNoiseAmp = 2.5 + r6 * 2.0;
          noiseFreq = 0.4 + r7 * 0.2;
        } else if (profileType < 9) {
          baseStiffness = 3.0 + r4 * 2.5;
          baseDamping = 0.9 + r5 * 0.04;
          baseNoiseAmp = 3.5 + r6 * 2.5;
          noiseFreq = 0.6 + r7 * 0.3;
        } else {
          baseStiffness = 2.0 + r4 * 2.0;
          baseDamping = 0.85 + r5 * 0.05;
          baseNoiseAmp = 4.5 + r6 * 3.0;
          noiseFreq = 0.5 + r7 * 0.4;
        }

        dots.push({
          pos: { x: startX, y: startY },
          vel: { x: 0, y: 0 },
          startPos: { x: startX, y: startY },
          radius: dotRadius * radiusVariation,
          baseStiffness,
          baseDamping,
          baseNoiseAmp,
          noiseFreq,
          seedA: r8 * 100,
          seedB: seededRandom(seed + 8) * 100,
          swayPhase,
          swayAmp,
          coordinatedPhase,
        });
      }

      dotsRef.current = dots;
    },
    [count, dotRadius]
  );

  // -------------------------------------------------------------------------
  // Targets Based on Scroll (allocation-free)
  // -------------------------------------------------------------------------

  const BLEND_PX = 140;

  const getTargetBlend = useCallback((scrollY: number) => {
    const scenes = sortedScenesRef.current;
    if (scenes.length === 0) return null;

    const getSceneCenterScore = (scene: SceneConfig) => {
      const len = scene.scrollEnd - scene.scrollStart;
      if (len <= 1e-3) return 1;
      const t = (scrollY - scene.scrollStart) / len;
      return Math.abs(t - 0.5);
    };

    const activeScenes: SceneConfig[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (scrollY >= scene.scrollStart && scrollY <= scene.scrollEnd) {
        activeScenes.push(scene);
      }
    }

    const pickActive = (mode: DotTargetProvider["mode"]): SceneConfig | null => {
      let best: SceneConfig | null = null;
      let bestScore = Infinity;
      for (const scene of activeScenes) {
        if (scene.provider.mode !== mode) continue;
        // Overlap tie-break: prefer the scene closest to its own center (t≈0.5),
        // then fall back to mount order (higher `order` wins) for determinism.
        const score = getSceneCenterScore(scene);
        if (
          score < bestScore ||
          (score === bestScore && best && scene.order > best.order)
        ) {
          best = scene;
          bestScore = score;
        } else if (!best) {
          best = scene;
          bestScore = score;
        }
      }
      return best;
    };

    // Mode arbitration (per-frame): scatter > dissipate > svg.
    const scatterScene = pickActive("scatter");
    if (scatterScene) {
      const from = sceneTargetsRef.current.get(scatterScene.id);
      if (!from) return null;
      return {
        from,
        to: null as Point[] | null,
        t: 0,
        mode: "scatter" as const,
        activeSceneId: scatterScene.id,
      };
    }

    const dissipateScene = pickActive("dissipate");
    if (dissipateScene) {
      const from = sceneTargetsRef.current.get(dissipateScene.id);
      if (!from) return null;
      return {
        from,
        to: null as Point[] | null,
        t: 0,
        mode: "dissipate" as const,
        activeSceneId: dissipateScene.id,
      };
    }

    const svgScene = pickActive("svg");
    if (svgScene) {
      const from = sceneTargetsRef.current.get(svgScene.id);
      if (!from) return null;

      const idx = scenes.indexOf(svgScene);
      const next = idx >= 0 ? scenes[idx + 1] : undefined;

      if (
        next &&
        next.provider.mode === "svg" &&
        scrollY > svgScene.scrollEnd - BLEND_PX &&
        scrollY <= svgScene.scrollEnd
      ) {
        const to = sceneTargetsRef.current.get(next.id);
        if (to) {
          const t = clamp01(
            (scrollY - (svgScene.scrollEnd - BLEND_PX)) / BLEND_PX
          );
          const activeSceneId = t > 0.5 ? next.id : svgScene.id;
          return { from, to, t, mode: "svg" as const, activeSceneId };
        }
      }

      return {
        from,
        to: null as Point[] | null,
        t: 0,
        mode: "svg" as const,
        activeSceneId: svgScene.id,
      };
    }

    // No active scene: only interpolate between SVG scenes (scatter/dissipate are
    // treated as strictly range-active to avoid leaking modes into gaps).
    let prevSvgIndex = -1;
    let nextSvgIndex = -1;
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      if (s.provider.mode !== "svg") continue;
      if (scrollY >= s.scrollEnd) prevSvgIndex = i;
      if (nextSvgIndex === -1 && scrollY < s.scrollStart) nextSvgIndex = i;
    }

    const firstSvgIndex =
      scenes.findIndex((s) => s.provider.mode === "svg") ?? -1;
    const lastSvgIndex = (() => {
      for (let i = scenes.length - 1; i >= 0; i--) {
        if (scenes[i].provider.mode === "svg") return i;
      }
      return -1;
    })();

    if (scrollY < scenes[0].scrollStart) {
      const idx = firstSvgIndex !== -1 ? firstSvgIndex : 0;
      const from = sceneTargetsRef.current.get(scenes[idx].id);
      if (!from) return null;
      return {
        from,
        to: null as Point[] | null,
        t: 0,
        mode: scenes[idx].provider.mode,
        activeSceneId: scenes[idx].id,
      };
    }

    if (scrollY > scenes[scenes.length - 1].scrollEnd) {
      const idx = lastSvgIndex !== -1 ? lastSvgIndex : scenes.length - 1;
      const from = sceneTargetsRef.current.get(scenes[idx].id);
      if (!from) return null;
      return {
        from,
        to: null as Point[] | null,
        t: 0,
        mode: scenes[idx].provider.mode,
        activeSceneId: scenes[idx].id,
      };
    }

    if (prevSvgIndex !== -1 && nextSvgIndex !== -1) {
      const a = scenes[prevSvgIndex];
      const b = scenes[nextSvgIndex];
      const from = sceneTargetsRef.current.get(a.id);
      const to = sceneTargetsRef.current.get(b.id);
      if (!from || !to) return null;
      const denom = b.scrollStart - a.scrollEnd;
      const t = denom <= 1e-3 ? 1 : clamp01((scrollY - a.scrollEnd) / denom);
      const activeSceneId = t > 0.5 ? b.id : a.id;
      return { from, to, t, mode: "svg" as const, activeSceneId };
    }

    if (prevSvgIndex !== -1) {
      const a = scenes[prevSvgIndex];
      const from = sceneTargetsRef.current.get(a.id);
      if (!from) return null;
      return {
        from,
        to: null as Point[] | null,
        t: 0,
        mode: "svg" as const,
        activeSceneId: a.id,
      };
    }

    if (nextSvgIndex !== -1) {
      const b = scenes[nextSvgIndex];
      const from = sceneTargetsRef.current.get(b.id);
      if (!from) return null;
      return {
        from,
        to: null as Point[] | null,
        t: 0,
        mode: "svg" as const,
        activeSceneId: b.id,
      };
    }

    const last = scenes[scenes.length - 1];
    const from = sceneTargetsRef.current.get(last.id);
    if (!from) return null;
    return {
      from,
      to: null as Point[] | null,
      t: 0,
      mode: last.provider.mode,
      activeSceneId: last.id,
    };
  }, []);

  const applyDissipateImpulse = useCallback(
    (sceneId: string, timeMs: number) => {
      const dots = dotsRef.current;
      if (dots.length === 0) return;

      const w = canvasSize.width;
      const h = canvasSize.height;
      if (w === 0 || h === 0) return;

      const centerX = w / 2;
      const centerY = h / 2;
      const strength = Math.min(w, h) * 0.9;

      const rand = makeMulberry32(hashStringToSeed(sceneId));

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        let dx = dot.pos.x - centerX;
        let dy = dot.pos.y - centerY;
        let len = Math.hypot(dx, dy);
        if (len < 1e-3) {
          dx = Math.cos(i);
          dy = Math.sin(i);
          len = 1;
        }

        const inv = 1 / len;
        const ux = dx * inv;
        const uy = dy * inv;
        const px = -uy;
        const py = ux;

        dot.vel.x += ux * strength;
        dot.vel.y += uy * strength;

        const jitter = (rand() - 0.5) * strength * 0.12;
        dot.vel.x += px * jitter;
        dot.vel.y += py * jitter;
      }

      dissipateImpulseKeyRef.current = sceneId;
      dissipateBurstUntilRef.current = timeMs + 450;
    },
    [canvasSize.height, canvasSize.width]
  );

  type TargetBlend = {
    from: Point[];
    to: Point[] | null;
    t: number;
    mode: DotTargetProvider["mode"];
    activeSceneId: string;
  };

  const retargetDotsToBlend = useCallback(
    (blend: TargetBlend, mode: RetargetMode, timeMs: number) => {
      const dots = dotsRef.current;
      if (dots.length === 0) return;

      const fromTargets = blend.from;
      const toTargets = blend.to;
      const blendT = blend.t;

      if (fromTargets.length === 0) return;

      if (currentHomeRef.current.length !== count) {
        currentHomeRef.current = new Array(count);
      }

      const maxVel = 1500;
      const snap = mode === "snap";

      if (snap) {
        retargetBoostUntilRef.current = timeMs + 200;
        retargetBoostFactorRef.current = 2.6;
        forceHomeSnapUntilRef.current = timeMs + 200;
      }

      for (let i = 0; i < count; i++) {
        const a = fromTargets[i % fromTargets.length];
        let tx = a.x;
        let ty = a.y;
        if (toTargets) {
          const b = toTargets[i % toTargets.length];
          tx = lerp(a.x, b.x, blendT);
          ty = lerp(a.y, b.y, blendT);
        }

        currentHomeRef.current[i] = { x: tx, y: ty };

        const dot = dots[i];
        if (!dot) continue;

        if (snap) {
          dot.vel.x *= 0.2;
          dot.vel.y *= 0.2;
        }

        const v = Math.hypot(dot.vel.x, dot.vel.y);
        if (v > maxVel) {
          const s = maxVel / v;
          dot.vel.x *= s;
          dot.vel.y *= s;
        }
      }
    },
    [count]
  );

  const retargetDotsToTargets = useCallback(
    (targets: Point[], mode: RetargetMode, timeMs: number) => {
      const blend: TargetBlend = {
        from: targets,
        to: null,
        t: 0,
        mode: "svg",
        activeSceneId: activeSceneIdRef.current ?? "manual",
      };
      retargetDotsToBlend(blend, mode, timeMs);
    },
    [retargetDotsToBlend]
  );

  const updateCurrentHomeTargets = useCallback(
    (timeMs: number) => {
      const blend = getTargetBlend(scrollYRef.current) as TargetBlend | null;
      if (!blend) return;

      if (pendingResizeSnapRef.current && !targetsLoadingRef.current) {
        pendingResizeSnapRef.current = false;
        retargetDotsToBlend(blend, "snap", timeMs);
      }

      const prevMode = activeModeRef.current;
      if (blend.mode !== prevMode) {
        modeTransitionRef.current = {
          from: prevMode,
          to: blend.mode,
          startTimeMs: timeMs,
        };
        activeModeRef.current = blend.mode;
      }

      activeSceneIdRef.current = blend.activeSceneId;

      const controllerChanged = lastActiveControllerIdRef.current !== blend.activeSceneId;
      lastActiveControllerIdRef.current = blend.activeSceneId;
      const activeScene = scenesRef.current.get(blend.activeSceneId) ?? null;
      const providerKeyNow = activeScene?.providerKey ?? null;
      const providerKeyChanged = lastActiveProviderKeyRef.current !== providerKeyNow;
      lastActiveProviderKeyRef.current = providerKeyNow;

      const maybeStartLock = (scene: SceneConfig | null, timeMs: number) => {
        if (!scene || scene.provider.mode !== "svg" || scene.lockInMs <= 0) return;
        lockStartRef.current = timeMs;
        lockUntilRef.current = timeMs + scene.lockInMs;
        lockSceneIdRef.current = scene.id;
      };

      if (activeScene && blend.mode === "svg") {
        if (activeScene.snapOnEnter && (controllerChanged || providerKeyChanged)) {
          burstUntilRef.current = timeMs + SNAP_ON_ENTER_BURST_MS;
          burstSceneIdRef.current = blend.activeSceneId;
          burstStiffnessMultRef.current = activeScene.stiffnessMult;
          burstDampingMultRef.current = activeScene.dampingMult;
          burstMaxSpeedMultRef.current = activeScene.maxSpeedMult;
        }

        if (controllerChanged || providerKeyChanged) {
          maybeStartLock(activeScene, timeMs);
          if (activeScene.homeSnapMs > 0) {
            forceHomeSnapUntilRef.current = Math.max(
              forceHomeSnapUntilRef.current,
              timeMs + activeScene.homeSnapMs
            );
          }
        }
      }

      if (
        blend.mode === "dissipate" &&
        dissipateImpulseKeyRef.current !== blend.activeSceneId
      ) {
        applyDissipateImpulse(blend.activeSceneId, timeMs);
      }

      const fromTargets = blend.from;
      const toTargets = blend.to;
      const blendT = blend.t;
      const activeConfig =
        blend.activeSceneId !== null
          ? scenesRef.current.get(blend.activeSceneId) ?? null
          : null;
      const morphMult = activeConfig?.morphSpeedMult ?? 1;
      const homeBlend =
        timeMs < forceHomeSnapUntilRef.current ? 1 : Math.min(1, morphSpeed * morphMult);

      if (currentHomeRef.current.length === 0) {
        const homes: Point[] = new Array(count);
        for (let i = 0; i < count; i++) {
          const a = fromTargets[i % fromTargets.length];
          if (toTargets) {
            const b = toTargets[i % toTargets.length];
            homes[i] = { x: lerp(a.x, b.x, blendT), y: lerp(a.y, b.y, blendT) };
          } else {
            homes[i] = { x: a.x, y: a.y };
          }
        }
        currentHomeRef.current = homes;
        return;
      }

      for (let i = 0; i < count; i++) {
        const a = fromTargets[i % fromTargets.length];
        let tx = a.x;
        let ty = a.y;
        if (toTargets) {
          const b = toTargets[i % toTargets.length];
          tx = lerp(a.x, b.x, blendT);
          ty = lerp(a.y, b.y, blendT);
        }

        const current = currentHomeRef.current[i];
        if (current) {
          current.x = lerp(current.x, tx, homeBlend);
          current.y = lerp(current.y, ty, homeBlend);
        } else {
          currentHomeRef.current[i] = { x: tx, y: ty };
        }
      }
    },
    [applyDissipateImpulse, count, getTargetBlend, morphSpeed, retargetDotsToBlend]
  );

  const retargetToSvgInternal = useCallback(
    (svgUrl: string, mode: RetargetMode, opts?: RetargetOpts) => {
      if (!svgUrl) return;

      const w = canvasSize.width;
      const h = canvasSize.height;
      if (w === 0 || h === 0) {
        pendingRetargetRef.current = { svgUrl, mode };
        return;
      }

      const blendNow = getTargetBlend(scrollYRef.current);
      if (blendNow && blendNow.mode !== "svg") return;

      const timeMs = engineTimeMsRef.current || performance.now();

      if (opts && opts.burstMs && opts.burstMs > 0) {
        const activeId = activeSceneIdRef.current ?? null;
        if (activeId) {
          burstUntilRef.current = timeMs + opts.burstMs;
          burstSceneIdRef.current = activeId;
          burstStiffnessMultRef.current = opts.stiffnessMult ?? 1;
          burstDampingMultRef.current = opts.dampingMult ?? 1;
          burstMaxSpeedMultRef.current = opts.maxSpeedMult ?? 1;
        }
      }
      const maybeStartLock = (sceneId: string | null, timeMs: number) => {
        if (!sceneId) return;
        const scene = scenesRef.current.get(sceneId);
        if (!scene || scene.provider.mode !== "svg" || scene.lockInMs <= 0) return;
        lockStartRef.current = timeMs;
        lockUntilRef.current = timeMs + scene.lockInMs;
        lockSceneIdRef.current = scene.id;
      };

      void (async () => {
        const activeId = activeSceneIdRef.current;
        const activeScene = activeId ? scenesRef.current.get(activeId) : undefined;
        const targetScale = activeScene?.targetScale ?? 1;
        const sceneAnchor = activeScene?.targetAnchor;
        const targets = await getSvgTargets(
          svgUrl,
          w,
          h,
          count,
          targetScale,
          sceneAnchor,
          activeScene?.targetOffsetY
        );

        const activeSceneId = activeSceneIdRef.current;
        if (activeSceneId) {
          const scene = scenesRef.current.get(activeSceneId);
          if (scene?.provider.mode === "svg") {
            sceneTargetsRef.current.set(activeSceneId, targets);
            if (scene.homeSnapMs > 0) {
              forceHomeSnapUntilRef.current = Math.max(
                forceHomeSnapUntilRef.current,
                timeMs + scene.homeSnapMs
              );
            }
            maybeStartLock(activeSceneId, timeMs);
          }
        }

        retargetDotsToTargets(targets, mode, timeMs);
      })().catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[DotsCanvas] retargetToSvg failed:", error);
        }
      });
    },
    [
      canvasSize.height,
      canvasSize.width,
      count,
      getSvgTargets,
      getTargetBlend,
      retargetDotsToTargets,
    ]
  );

  useEffect(() => {
    const fn: RetargetFn = (svgUrl: string, mode: RetargetMode, opts?: RetargetOpts) => {
      retargetToSvgInternal(svgUrl, mode, opts);
    };
    mountedCanvasInstances.add(fn);
    return () => {
      mountedCanvasInstances.delete(fn);
    };
  }, [retargetToSvgInternal]);

  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;
    const pending = pendingRetargetRef.current;
    if (!pending) return;
    pendingRetargetRef.current = null;
    retargetToSvgInternal(pending.svgUrl, pending.mode);
  }, [canvasSize.height, canvasSize.width, retargetToSvgInternal]);

  // -------------------------------------------------------------------------
  // Physics Update
  // -------------------------------------------------------------------------

  const updatePhysics = useCallback(
    (dt: number, time: number, timestamp: number) => {
      const dots = dotsRef.current;
      const startTs = startTsRef.current;
      const phase = phaseRef.current;
      const currentHome = currentHomeRef.current;

      if (dots.length === 0 || currentHome.length === 0) return;

      const activeControllerId = activeSceneIdRef.current;
      const activeConfig = activeControllerId
        ? scenesRef.current.get(activeControllerId) ?? null
        : null;

      const applySceneOverrides =
        activeConfig && activeConfig.provider.mode === activeModeRef.current;

      const sceneStiffnessMult = applySceneOverrides
        ? activeConfig.stiffnessMult
        : 1;
      const sceneDampingMult = applySceneOverrides ? activeConfig.dampingMult : 1;
      const sceneMaxSpeedMult = applySceneOverrides
        ? activeConfig.maxSpeedMult
        : 1;
      const sceneLockInMs = activeConfig?.lockInMs ?? 0;
      const sceneSwayRampMs = activeConfig?.swayRampMs ?? 0;
      const sceneSwayStyle = activeConfig?.swayStyle ?? "force";
      const sceneSettleRadiusPx = activeConfig?.settleRadiusPx ?? 0;
      const sceneSnapRadiusPx = activeConfig?.snapRadiusPx ?? 0;
      const sceneSnapSpeedPxPerSec = activeConfig?.snapSpeedPxPerSec ?? 0;

      const applyBurst =
        activeControllerId !== null &&
        burstSceneIdRef.current === activeControllerId &&
        timestamp < burstUntilRef.current;

      const burstStiffnessMult = applyBurst ? burstStiffnessMultRef.current : 1;
      const burstDampingMult = applyBurst ? burstDampingMultRef.current : 1;
      const burstMaxSpeedMult = applyBurst ? burstMaxSpeedMultRef.current : 1;

      const effectiveStiffnessMult = sceneStiffnessMult * burstStiffnessMult;
      const effectiveDampingMult = sceneDampingMult * burstDampingMult;
      const effectiveMaxSpeedMult = sceneMaxSpeedMult * burstMaxSpeedMult;
      const shouldApplyMaxSpeedClamp = applySceneOverrides || applyBurst;
      const maxSpeed = shouldApplyMaxSpeedClamp
        ? BASE_MAX_SPEED_PX_PER_S * effectiveMaxSpeedMult
        : 0;
      const isSvgActive = activeModeRef.current === "svg";
      const lockActive =
        isSvgActive &&
        activeControllerId !== null &&
        activeControllerId === lockSceneIdRef.current &&
        sceneLockInMs > 0 &&
        timestamp < lockUntilRef.current;
      const isDayScene = (activeConfig?.morphSpeedMult ?? 1) > 1.01;

      let initialProgress = 0;
      let transitionProgress = 0;

      if (startTs !== null) {
        const elapsed = timestamp - startTs;

        if (phase === "initial") {
          initialProgress = clamp01(elapsed / initialDurationMs);
          if (initialProgress >= 1) {
            phaseRef.current = "transition";
            transitionProgressRef.current = 0;
          }
        } else if (phase === "transition") {
          initialProgress = 1;
          const transitionElapsed = elapsed - initialDurationMs;
          transitionProgress = clamp01(transitionElapsed / transitionDurationMs);
          transitionProgressRef.current = transitionProgress;
          if (transitionProgress >= 1) {
            phaseRef.current = "scrolling";
          }
        } else {
          initialProgress = 1;
          transitionProgress = 1;
        }
      }
      initialProgressRef.current = initialProgress;

      const globalOscillatorX = Math.cos(time * 0.3);
      const globalOscillatorY = Math.sin(time * 0.3 + Math.PI / 4);

      const easedInitialProgress = easeInOutCubic(initialProgress);
      const easedTransitionProgress = easeOutQuad(transitionProgress);

      const modeNow = activeModeRef.current;
      let stiffnessMult = 1;
      let noiseMult = 1;
      let jitterMult = 0;

      const modeTransition = modeTransitionRef.current;
      if (modeTransition) {
        const t = clamp01(
          (timestamp - modeTransition.startTimeMs) / MODE_TRANSITION_MS
        );
        const easedT = easeOutQuad(t);

        const a = MODE_PARAMS[modeTransition.from];
        const b = MODE_PARAMS[modeTransition.to];
        stiffnessMult = lerp(a.stiffnessMult, b.stiffnessMult, easedT);
        noiseMult = lerp(a.noiseMult, b.noiseMult, easedT);
        jitterMult = lerp(a.jitterMult, b.jitterMult, easedT);

        if (t >= 1) {
          modeTransitionRef.current = null;
        }
      } else {
        const p = MODE_PARAMS[modeNow];
        stiffnessMult = p.stiffnessMult;
        noiseMult = p.noiseMult;
        jitterMult = p.jitterMult;
      }

      const retargetBoost =
        timestamp < retargetBoostUntilRef.current
          ? retargetBoostFactorRef.current
          : 1;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const home = currentHome[i] || currentHome[0];

        if (phase === "initial") {
          dot.pos.x = lerp(dot.startPos.x, home.x, easedInitialProgress);
          dot.pos.y = lerp(dot.startPos.y, home.y, easedInitialProgress);
          dot.vel.x = 0;
          dot.vel.y = 0;
        } else if (phase === "transition") {
          const dx = home.x - dot.pos.x;
          const dy = home.y - dot.pos.y;

          const stiffness =
            dot.baseStiffness *
            lerp(2.0, 0.3, easedTransitionProgress) *
            effectiveStiffnessMult;
          const noiseAmp =
            dot.baseNoiseAmp * lerp(0.0, 1.5, easedTransitionProgress);
          const damping = dot.baseDamping * effectiveDampingMult;

          let fx = stiffness * dx;
          let fy = stiffness * dy;

          if (dot.coordinatedPhase) {
            const coordAmp = noiseAmp * 0.8;
            fx += globalOscillatorX * coordAmp;
            fy += globalOscillatorY * coordAmp;

            const individualVariation = noiseAmp * 0.3;
            const noise = generateNoise(
              time * dot.noiseFreq * 0.5,
              dot.seedA,
              dot.seedB
            );
            fx += noise.x * individualVariation;
            fy += noise.y * individualVariation;
          } else {
            const noise = generateNoise(time * dot.noiseFreq, dot.seedA, dot.seedB);
            fx += noise.x * noiseAmp;
            fy += noise.y * noiseAmp;
          }

          dot.vel.x = (dot.vel.x + fx * dt) * damping;
          dot.vel.y = (dot.vel.y + fy * dt) * damping;
          if (maxSpeed > 0) {
            const v = Math.hypot(dot.vel.x, dot.vel.y);
            if (v > maxSpeed) {
              const s = maxSpeed / v;
              dot.vel.x *= s;
              dot.vel.y *= s;
            }
          }
          dot.pos.x += dot.vel.x * dt;
          dot.pos.y += dot.vel.y * dt;
        } else {
          const dx = home.x - dot.pos.x;
          const dy = home.y - dot.pos.y;

          const dist2 = dx * dx + dy * dy;
          const vel2 = dot.vel.x * dot.vel.x + dot.vel.y * dot.vel.y;

          // Hard snap when close and slow - eliminates asymptotic crawl
          if (dist2 <= 6.25 && vel2 <= 2500) { // 2.5px distance, 50px/s velocity
            dot.pos.x = home.x;
            dot.pos.y = home.y;
            dot.vel.x = 0;
            dot.vel.y = 0;
            continue;
          }

          // Higher stiffness for faster snapping during scroll
          let stiffness =
            dot.baseStiffness *
            1.2 *
            stiffnessMult *
            retargetBoost *
            effectiveStiffnessMult;
          let noiseAmp = dot.baseNoiseAmp * 0.8 * noiseMult;
          let damping = dot.baseDamping * effectiveDampingMult;

          if (modeNow === "scatter") {
            const wobble = 0.5 + 0.5 * Math.sin(time * 0.9 + dot.seedA);
            damping = damping * (0.93 + wobble * 0.06);
            damping = Math.min(0.985, damping);
          } else if (modeNow === "dissipate") {
            if (timestamp < dissipateBurstUntilRef.current) {
              damping = Math.min(0.995, damping + 0.06);
            }
          }

          const useTargetOffset = isSvgActive && sceneSwayStyle === "targetOffset";

          if (isSvgActive && lockActive) {
            noiseAmp = 0;
            damping = Math.min(0.995, damping * 1.08);
            stiffness *= 2.35;
          }

          let targetX = home.x;
          let targetY = home.y;

          if (useTargetOffset) {
            const rampT =
              sceneSwayRampMs > 0
                ? clamp01((timestamp - lockUntilRef.current) / sceneSwayRampMs)
                : 1;
            const settle =
              sceneSettleRadiusPx > 0
                ? (() => {
                    const dist = Math.hypot(dx, dy);
                    const t = clamp01(1 - dist / sceneSettleRadiusPx);
                    return t * t;
                  })()
                : 1;
            const ramp = rampT * rampT * (3 - 2 * rampT); // smoothstep
            const swayAmp = lockActive ? 0 : noiseAmp * ramp * settle * 0.35;
            if (swayAmp > 0) {
              const oscX = Math.sin(time * 0.6 + dot.swayPhase * 0.3);
              const oscY = Math.cos(time * 0.65 + dot.swayPhase * 0.5);
              const noise = generateNoise(time * dot.noiseFreq, dot.seedA, dot.seedB);
              const ox = (oscX + noise.x * 0.6) * swayAmp;
              const oy = (oscY + noise.y * 0.6) * swayAmp;
              targetX = home.x + ox;
              targetY = home.y + oy;
            }
          }

          const finalDx = targetX - dot.pos.x;
          const finalDy = targetY - dot.pos.y;
          if (
            isDayScene &&
            !lockActive &&
            sceneSnapRadiusPx > 0 &&
            sceneSnapSpeedPxPerSec > 0
          ) {
            const dist = Math.hypot(finalDx, finalDy);
            const speed = Math.hypot(dot.vel.x, dot.vel.y);
            if (
              dist <= sceneSnapRadiusPx * 1.5 &&
              speed <= sceneSnapSpeedPxPerSec
            ) {
              dot.pos.x = targetX;
              dot.pos.y = targetY;
              dot.vel.x = 0;
              dot.vel.y = 0;
              continue;
            }
          }

          if (
            lockActive &&
            sceneSnapRadiusPx > 0 &&
            sceneSnapSpeedPxPerSec > 0
          ) {
            const dist = Math.hypot(finalDx, finalDy);
            const speed = Math.hypot(dot.vel.x, dot.vel.y);
            if (dist <= sceneSnapRadiusPx && speed <= sceneSnapSpeedPxPerSec) {
              dot.pos.x = targetX;
              dot.pos.y = targetY;
              dot.vel.x = 0;
              dot.vel.y = 0;
              continue;
            }
          }

          let fx = stiffness * finalDx;
          let fy = stiffness * finalDy;

          if (!useTargetOffset) {
            if (modeNow === "scatter") {
              const jitter = noiseAmp * jitterMult;
              fx += Math.sin(time * 1.3 + dot.swayPhase) * jitter;
              fy += Math.cos(time * 1.5 + dot.swayPhase * 0.7) * jitter;
            }

            if (dot.coordinatedPhase) {
              const coordAmp = noiseAmp * 0.6;
              fx += globalOscillatorX * coordAmp;
              fy += globalOscillatorY * coordAmp;

              const individualVariation = noiseAmp * 0.2;
              const noise = generateNoise(
                time * dot.noiseFreq * 0.5,
                dot.seedA,
                dot.seedB
              );
              fx += noise.x * individualVariation;
              fy += noise.y * individualVariation;
            } else {
              const noise = generateNoise(
                time * dot.noiseFreq,
                dot.seedA,
                dot.seedB
              );
              fx += noise.x * noiseAmp;
              fy += noise.y * noiseAmp;
            }
          }

          dot.vel.x = (dot.vel.x + fx * dt) * damping;
          dot.vel.y = (dot.vel.y + fy * dt) * damping;
          if (maxSpeed > 0) {
            const v = Math.hypot(dot.vel.x, dot.vel.y);
            if (v > maxSpeed) {
              const s = maxSpeed / v;
              dot.vel.x *= s;
              dot.vel.y *= s;
            }
          }
          dot.pos.x += dot.vel.x * dt;
          dot.pos.y += dot.vel.y * dt;
        }
      }
    },
    [initialDurationMs, transitionDurationMs]
  );

  // -------------------------------------------------------------------------
  // Draw
  // -------------------------------------------------------------------------

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    const dots = dotsRef.current;
    const currentHome = currentHomeRef.current;
    if (currentHome.length === 0) return;
    const SETTLED_PX = 1.25;

    const grayRgb = grayRgbRef.current;
    const accentRgb = accentRgbRef.current;

    const time = timeRef.current;
    const SWAY_FREQ = 0.35;
    const phase = phaseRef.current;
    const isBreathingOrScrolling = phase === "scrolling" || phase === "transition";
    const activeSceneId = activeSceneIdRef.current;
    const activeScene =
      activeSceneId !== null ? scenesRef.current.get(activeSceneId) ?? null : null;
    const isTargetOffsetSway = activeScene?.swayStyle === "targetOffset";
    const lockActive =
      activeSceneId !== null &&
      activeSceneId === lockSceneIdRef.current &&
      (activeScene?.lockInMs ?? 0) > 0 &&
      performance.now() < lockUntilRef.current;

    let swayMultiplier = 1;
    if (phase === "initial") {
      swayMultiplier = 0;
    } else if (phase === "transition") {
      swayMultiplier = easeOutQuad(transitionProgressRef.current);
    }

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      if (
        dot.pos.x < -50 ||
        dot.pos.x > width + 50 ||
        dot.pos.y < -50 ||
        dot.pos.y > height + 50
      ) {
        continue;
      }

      const home = currentHome[i] || currentHome[0];
      if (!home) continue;
      const dx = dot.pos.x - home.x;
      const dy = dot.pos.y - home.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const t = Math.min(dist / SETTLED_PX, 1);
      const easedT = easeOut(1 - t);

      const r = Math.round(lerp(grayRgb.r, accentRgb.r, easedT));
      const g = Math.round(lerp(grayRgb.g, accentRgb.g, easedT));
      const b = Math.round(lerp(grayRgb.b, accentRgb.b, easedT));
      ctx.fillStyle = `rgb(${r},${g},${b})`;

      let swayX: number;
      let swayY: number;

      let drawSwayAllowed =
        !lockActive &&
        (!isTargetOffsetSway ||
          (activeScene?.settleRadiusPx ?? 0) === 0 ||
          dist <= (activeScene?.settleRadiusPx ?? 0));

      if (isTargetOffsetSway) {
        // Target-offset scenes sway via physics target offset; disable draw-time sway.
        drawSwayAllowed = false;
      }

      if (drawSwayAllowed) {
        if (isBreathingOrScrolling && dot.coordinatedPhase) {
          const globalPhase = time * 0.3;
          swayX =
            Math.sin(globalPhase + dot.swayPhase * 0.5) *
            dot.swayAmp *
            swayMultiplier;
          swayY =
            Math.cos(globalPhase + dot.swayPhase * 0.7) *
            dot.swayAmp *
            swayMultiplier;
        } else {
          swayX =
            Math.sin(time * SWAY_FREQ + dot.swayPhase) *
            dot.swayAmp *
            swayMultiplier;
          swayY =
            Math.cos(time * SWAY_FREQ + dot.swayPhase * 1.3) *
            dot.swayAmp *
            swayMultiplier;
        }
      } else {
        swayX = 0;
        swayY = 0;
      }

      const drawX = dot.pos.x + swayX;
      const drawY = dot.pos.y + swayY;

      if (
        drawX >= -dot.radius &&
        drawX <= width + dot.radius &&
        drawY >= -dot.radius &&
        drawY <= height + dot.radius
      ) {
        ctx.beginPath();
        ctx.arc(drawX, drawY, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  const drawReducedMotion = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);
    
    // Use resolved gray color from ref (already resolved from CSS variable or prop)
    const { r, g, b } = grayRgbRef.current;
    ctx.fillStyle = `rgb(${r},${g},${b})`;

    const currentHome = currentHomeRef.current;
    for (let i = 0; i < currentHome.length; i++) {
      const home = currentHome[i];
      ctx.beginPath();
      ctx.arc(home.x, home.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [dotRadius]);

  // -------------------------------------------------------------------------
  // Animation Loop
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const container = containerRef.current;
    if (!container) return;

    const size = setupCanvas();
    if (!size) return;

    const scheduleResize = () => {
      if (resizeRafRef.current !== null) return;
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        pendingResizeSnapRef.current = true;
        setupCanvas();
      });
    };

    const stopResize = observeResize(container, scheduleResize);

    return () => {
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      stopResize();
    };
  }, [setupCanvas]);

  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      scrollYRef.current = state.scrollY;
      engineTimeMsRef.current = state.time;

      if (prefersReducedMotionRef.current) {
        updateCurrentHomeTargets(state.time);
        drawReducedMotion();
        return;
      }

      if (startTsRef.current === null) {
        startTsRef.current = state.time;
        phaseRef.current = "initial";
      }

      let dt = 0;
      if (lastTimeRef.current !== null) {
        const rawDt = (state.time - lastTimeRef.current) / 1000;
        dt = Math.min(Math.max(rawDt, 0), 0.033);
      }
      lastTimeRef.current = state.time;

      const timeSeconds = state.time / 1000;
      timeRef.current = timeSeconds;

      updateCurrentHomeTargets(state.time);
      updatePhysics(dt, timeSeconds, state.time);
      draw();
    });

    return unsubscribe;
  }, [draw, drawReducedMotion, updateCurrentHomeTargets, updatePhysics]);

  useEffect(() => {
    if (canvasSize.width > 0 && scenesRef.current.size > 0) {
      loadAllSceneTargets();
    }
  }, [canvasSize, loadAllSceneTargets, scenesVersion]);

  useEffect(() => {
    if (canvasSize.width === 0) return;

    if (lastCountRef.current !== count) {
      lastCountRef.current = count;
      needsReinitRef.current = true;
    }

    if (!needsReinitRef.current) return;

    initializeDots(canvasSize.width, canvasSize.height);
    currentHomeRef.current = [];
    activeModeRef.current = sortedScenesRef.current[0]?.provider.mode ?? "svg";
    activeSceneIdRef.current = null;
    dissipateImpulseKeyRef.current = null;
    dissipateBurstUntilRef.current = 0;
    modeTransitionRef.current = null;

    startTsRef.current = null;
    phaseRef.current = "initial";
    lastTimeRef.current = null;
    needsReinitRef.current = false;
  }, [canvasSize, count, initializeDots]);

  // -------------------------------------------------------------------------
  // Cleanup on Unmount
  // -------------------------------------------------------------------------
  // Clean up module-level caches and global state when DotsCanvas unmounts
  // to prevent memory leaks across Next.js soft navigations.

  useEffect(() => {
    return () => {
      // Clear SVG parsing and fitted points caches (removes DOM elements from body)
      clearSvgCaches();
      // Reset engine state (stops RAF loop, clears subscribers, resets scroll container)
      resetEngine();
      // Clear the global retarget functions set
      mountedCanvasInstances.clear();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const contextValue = useMemo<DotsCanvasContextValue>(
    () => ({
      registerScene,
      unregisterScene,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
    }),
    [registerScene, unregisterScene, canvasSize.width, canvasSize.height]
  );

  return (
    <DotsCanvasContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={className}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      {children}
    </DotsCanvasContext.Provider>
  );
}
