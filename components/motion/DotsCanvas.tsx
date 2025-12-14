"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  parseSvgPaths,
  samplePointsFromPaths,
  samplePointsInFillFromPaths,
  fitPointsToRect,
  type Point,
} from "@/lib/motion/svgSample";
import { subscribe } from "@/motion/engine";
import { clamp01, lerp } from "@/motion/math";
import { observeResize } from "@/motion/observe";

// ============================================================================
// Types
// ============================================================================

interface SceneConfig {
  id: string;
  svgUrl: string;
  scrollStart: number;
  scrollEnd: number;
}

interface DotsCanvasContextValue {
  registerScene: (config: SceneConfig) => void;
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
  /** Gray color when dots are far from home (default: "#A1A1AA") */
  colorGray?: string;
  /** Accent color when dots are settled (default: "#00A452") */
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

  if (anchor.includes("left")) {
    offsetX = 0;
  } else if (anchor.includes("right")) {
    offsetX = canvasWidth - targetWidth;
  } else {
    offsetX = (canvasWidth - targetWidth) / 2;
  }

  if (anchor.includes("top")) {
    offsetY = 0;
  } else if (anchor.includes("bottom")) {
    offsetY = canvasHeight - targetHeight;
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
  colorGray = "#A1A1AA",
  colorAccent = "#00A452",
}: DotsCanvasProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const scenesRef = useRef<Map<string, SceneConfig>>(new Map());
  const scenePointsRef = useRef<Map<string, Point[]>>(new Map());
  const currentHomeRef = useRef<Point[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const phaseRef = useRef<"initial" | "transition" | "scrolling">("initial");
  const initialProgressRef = useRef<number>(0);
  const transitionProgressRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef(false);

  // Pre-parse colors
  const grayRgbRef = useRef(hexToRgb(colorGray));
  const accentRgbRef = useRef(hexToRgb(colorAccent));

  // State
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scenesLoaded, setScenesLoaded] = useState(false);

  // Update colors when props change
  useEffect(() => {
    grayRgbRef.current = hexToRgb(colorGray);
    accentRgbRef.current = hexToRgb(colorAccent);
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
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return undefined;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    setCanvasSize({ width, height });
    return { width, height, dpr };
  }, []);

  // -------------------------------------------------------------------------
  // SVG Loading
  // -------------------------------------------------------------------------

  const loadSvgPoints = useCallback(
    async (
      svgUrl: string,
      canvasWidth: number,
      canvasHeight: number
    ): Promise<Point[]> => {
      const { offsetX, offsetY } = calculateTargetOffset(
        canvasWidth,
        canvasHeight,
        targetWidth,
        targetHeight,
        targetAnchor
      );

      let cleanup: (() => void) | null = null;

      try {
        const response = await fetch(svgUrl);
        if (!response.ok) throw new Error(`Failed to fetch SVG: ${svgUrl}`);
        const svgText = await response.text();

        const {
          paths,
          viewBox,
          svg,
          cleanup: cleanupFn,
        } = parseSvgPaths(svgText);
        cleanup = cleanupFn;

        if (paths.length === 0) throw new Error("No paths found in SVG");

        const outlineCount = Math.floor(count * 0.85);
        const interiorCount = count - outlineCount;

        const outlinePoints = samplePointsFromPaths(paths, outlineCount);
        if (outlinePoints.length === 0)
          throw new Error("Failed to sample outline points");

        let interiorPoints: Point[] = [];
        try {
          interiorPoints = await samplePointsInFillFromPaths(
            paths,
            viewBox,
            interiorCount,
            svg
          );
          if (interiorPoints.length < interiorCount) {
            const additionalOutline = samplePointsFromPaths(
              paths,
              interiorCount - interiorPoints.length
            );
            interiorPoints = interiorPoints.concat(additionalOutline);
          }
        } catch {
          const additionalOutline = samplePointsFromPaths(paths, interiorCount);
          interiorPoints = additionalOutline;
        }

        const sampledPoints = outlinePoints.concat(interiorPoints);
        const fittedPoints = fitPointsToRect(
          sampledPoints,
          viewBox,
          targetWidth,
          targetHeight,
          0
        );

        return fittedPoints.map((p) => ({
          x: p.x + offsetX,
          y: p.y + offsetY,
        }));
      } catch (error) {
        console.warn(`Failed to load SVG ${svgUrl}, using fallback:`, error);
        const fallbackPoints = generateFallbackPoints(
          count,
          targetWidth,
          targetHeight
        );
        return fallbackPoints.map((p) => ({
          x: p.x + offsetX,
          y: p.y + offsetY,
        }));
      } finally {
        if (cleanup) cleanup();
      }
    },
    [count, targetWidth, targetHeight, targetAnchor]
  );

  // -------------------------------------------------------------------------
  // Scene Registration
  // -------------------------------------------------------------------------

  const registerScene = useCallback((config: SceneConfig) => {
    scenesRef.current.set(config.id, config);
  }, []);

  const unregisterScene = useCallback((id: string) => {
    scenesRef.current.delete(id);
    scenePointsRef.current.delete(id);
  }, []);

  // -------------------------------------------------------------------------
  // Load All Scene Points
  // -------------------------------------------------------------------------

  const loadAllScenePoints = useCallback(async () => {
    const scenes = Array.from(scenesRef.current.values());
    if (scenes.length === 0 || canvasSize.width === 0) return;

    const loadPromises = scenes.map(async (scene) => {
      if (!scenePointsRef.current.has(scene.id)) {
        const points = await loadSvgPoints(
          scene.svgUrl,
          canvasSize.width,
          canvasSize.height
        );
        scenePointsRef.current.set(scene.id, points);
      }
    });

    await Promise.all(loadPromises);
    setScenesLoaded(true);
  }, [canvasSize, loadSvgPoints]);

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
  // Get Current Target Points Based on Scroll
  // -------------------------------------------------------------------------

  const getCurrentTargetPoints = useCallback(
    (scrollY: number): Point[] | null => {
      const scenes = Array.from(scenesRef.current.values()).sort(
        (a, b) => a.scrollStart - b.scrollStart
      );

      if (scenes.length === 0) return null;

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const nextScene = scenes[i + 1];

        if (scrollY < scene.scrollStart && i === 0) {
          return scenePointsRef.current.get(scene.id) || null;
        }

        if (scrollY >= scene.scrollStart && scrollY <= scene.scrollEnd) {
          const scenePoints = scenePointsRef.current.get(scene.id);
          if (!scenePoints) return null;

          if (nextScene) {
            const nextPoints = scenePointsRef.current.get(nextScene.id);
            if (nextPoints && scrollY > scene.scrollEnd - 100) {
              const blendStart = scene.scrollEnd - 100;
              const blendProgress = clamp01(
                (scrollY - blendStart) / (scene.scrollEnd - blendStart)
              );
              return scenePoints.map((p, idx) => ({
                x: lerp(p.x, nextPoints[idx]?.x ?? p.x, blendProgress),
                y: lerp(p.y, nextPoints[idx]?.y ?? p.y, blendProgress),
              }));
            }
          }

          return scenePoints;
        }

        if (
          nextScene &&
          scrollY > scene.scrollEnd &&
          scrollY < nextScene.scrollStart
        ) {
          const scenePoints = scenePointsRef.current.get(scene.id);
          const nextPoints = scenePointsRef.current.get(nextScene.id);

          if (scenePoints && nextPoints) {
            const gapProgress = clamp01(
              (scrollY - scene.scrollEnd) /
                (nextScene.scrollStart - scene.scrollEnd)
            );
            return scenePoints.map((p, idx) => ({
              x: lerp(p.x, nextPoints[idx]?.x ?? p.x, gapProgress),
              y: lerp(p.y, nextPoints[idx]?.y ?? p.y, gapProgress),
            }));
          }
        }
      }

      const lastScene = scenes[scenes.length - 1];
      return scenePointsRef.current.get(lastScene.id) || null;
    },
    []
  );

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
            dot.baseStiffness * lerp(2.0, 0.3, easedTransitionProgress);
          const noiseAmp =
            dot.baseNoiseAmp * lerp(0.0, 1.5, easedTransitionProgress);
          const damping = dot.baseDamping;

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
          dot.pos.x += dot.vel.x * dt;
          dot.pos.y += dot.vel.y * dt;
        } else {
          const dx = home.x - dot.pos.x;
          const dy = home.y - dot.pos.y;

          // Higher stiffness for faster snapping during scroll
          const stiffness = dot.baseStiffness * 1.2;
          const noiseAmp = dot.baseNoiseAmp * 0.8;
          const damping = dot.baseDamping;

          let fx = stiffness * dx;
          let fy = stiffness * dy;

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
            const noise = generateNoise(time * dot.noiseFreq, dot.seedA, dot.seedB);
            fx += noise.x * noiseAmp;
            fy += noise.y * noiseAmp;
          }

          dot.vel.x = (dot.vel.x + fx * dt) * damping;
          dot.vel.y = (dot.vel.y + fy * dt) * damping;
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
    const SETTLED_PX = 1.25;

    const grayRgb = grayRgbRef.current;
    const accentRgb = accentRgbRef.current;

    const time = timeRef.current;
    const SWAY_FREQ = 0.35;
    const phase = phaseRef.current;
    const isBreathingOrScrolling = phase === "scrolling" || phase === "transition";

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

  // -------------------------------------------------------------------------
  // Animation Loop
  // -------------------------------------------------------------------------

  const animate = useCallback(
    (timestamp: number) => {
      if (prefersReducedMotionRef.current) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = colorGray;

        const currentHome = currentHomeRef.current;
        for (let i = 0; i < currentHome.length; i++) {
          const home = currentHome[i];
          ctx.beginPath();
          ctx.arc(home.x, home.y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        return;
      }

      if (startTsRef.current === null) {
        startTsRef.current = timestamp;
        phaseRef.current = "initial";
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      const dt = Math.min(rawDt, 0.033);
      lastTimeRef.current = timestamp;

      const time = timestamp / 1000;
      timeRef.current = time;

      // Update current home positions based on scroll
      const targetPoints = getCurrentTargetPoints(scrollYRef.current);
      if (targetPoints) {
        if (currentHomeRef.current.length === 0) {
          currentHomeRef.current = targetPoints.map((p) => ({ ...p }));
        } else {
          for (let i = 0; i < targetPoints.length; i++) {
            const current = currentHomeRef.current[i];
            const target = targetPoints[i];
            if (current && target) {
              current.x = lerp(current.x, target.x, morphSpeed);
              current.y = lerp(current.y, target.y, morphSpeed);
            }
          }
        }
      }

      updatePhysics(dt, time, timestamp);
      draw();

      rafIdRef.current = requestAnimationFrame(animate);
    },
    [colorGray, dotRadius, getCurrentTargetPoints, morphSpeed, updatePhysics, draw]
  );

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

    const stopResize = observeResize(container, () => {
      setupCanvas();
    });

    return () => {
      stopResize();
    };
  }, [setupCanvas]);

  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      scrollYRef.current = state.scrollY;
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (canvasSize.width > 0 && scenesRef.current.size > 0) {
      loadAllScenePoints();
    }
  }, [canvasSize, loadAllScenePoints]);

  useEffect(() => {
    if (!scenesLoaded || canvasSize.width === 0) return;

    initializeDots(canvasSize.width, canvasSize.height);

    const initialPoints = getCurrentTargetPoints(0);
    if (initialPoints) {
      currentHomeRef.current = initialPoints.map((p) => ({ ...p }));
    }

    startTsRef.current = null;
    phaseRef.current = "initial";
    lastTimeRef.current = null;
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    scenesLoaded,
    canvasSize,
    initializeDots,
    getCurrentTargetPoints,
    animate,
  ]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const contextValue: DotsCanvasContextValue = {
    registerScene,
    unregisterScene,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
  };

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