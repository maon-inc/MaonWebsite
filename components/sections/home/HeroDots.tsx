"use client";

import React, { useEffect, useRef } from "react";
import {
  parseSvgPaths,
  samplePointsFromPaths,
  samplePointsInFillFromPaths,
  fitPointsToRect,
  type Point,
} from "@/lib/motion/svgSample";
import { observeResize } from "@/motion/observe";

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

type Props = {
  svgUrl?: string;
  count?: number;
  dotRadius?: number;
  spread?: number;
  durationMs?: number;
  className?: string;
  targetWidth?: number;
  targetHeight?: number;
  targetAnchor?: TargetAnchor;
};

interface Dot {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  home: { x: number; y: number };
  startPos: { x: number; y: number };
  radius: number;
  stiffness: number;
  damping: number;
  noiseAmp: number;
  noiseFreq: number;
  seedA: number;
  seedB: number;
  baseStiffness: number;
  baseDamping: number;
  baseNoiseAmp: number;
  stiffnessMult: number;
  noiseMult: number;
  swayPhase: number;
  swayAmp: number;
  coordinatedPhase: boolean;
}

function generateNoise(t: number, seedA: number, seedB: number): { x: number; y: number } {
  return {
    x: Math.sin(t * seedA + seedB) * Math.cos(t * seedB * 0.7),
    y: Math.cos(t * seedA * 0.8 + seedB) * Math.sin(t * seedB),
  };
}

function generateFallbackPoints(count: number, width: number, height: number): Point[] {
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

export default function HeroDots({
  svgUrl = "/assets/hero_svg.svg",
  count = 1700,
  dotRadius = 1.8,
  spread = 0.9,
  durationMs = 5000,
  className,
  targetWidth = 500,
  targetHeight = 500,
  targetAnchor = "center",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const targetPointsRef = useRef<Point[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const phaseRef = useRef<"snap" | "transition" | "breathe">("snap");
  const snapProgressRef = useRef<number>(0);
  const transitionProgressRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef(false);
  const resizeRafRef = useRef<number | null>(null);

  // Transition duration from snap to breathing (in ms)
  const transitionDurationMs = 2000;

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { width, height, dpr };
  };

  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const initializeDots = (targetPoints: Point[], width: number, height: number) => {
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
      const target = targetPoints[i % targetPoints.length];
      const home = { x: target.x, y: target.y };
      
      const startX = r1 * width;
      const startY = r2 * height;
      const pos = { x: startX, y: startY };
      const startPos = { x: startX, y: startY };
      
      const coordinatedPhase = (i % 4) < 3;

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
        baseDamping = 0.90 + r5 * 0.04;
        baseNoiseAmp = 3.5 + r6 * 2.5;
        noiseFreq = 0.6 + r7 * 0.3;
      } else {
        baseStiffness = 2.0 + r4 * 2.0;
        baseDamping = 0.85 + r5 * 0.05;
        baseNoiseAmp = 4.5 + r6 * 3.0;
        noiseFreq = 0.5 + r7 * 0.4;
      }

      dots.push({
        pos,
        vel: { x: 0, y: 0 },
        home,
        startPos,
        radius: dotRadius * radiusVariation,
        stiffness: baseStiffness,
        damping: baseDamping,
        noiseAmp: baseNoiseAmp,
        noiseFreq,
        seedA: r8 * 100,
        seedB: seededRandom(seed + 8) * 100,
        baseStiffness,
        baseDamping,
        baseNoiseAmp,
        stiffnessMult: 1,
        noiseMult: 1,
        swayPhase,
        swayAmp,
        coordinatedPhase,
      });
    }

    dotsRef.current = dots;
  };

  const loadTargetsOnly = async (canvasWidth: number, canvasHeight: number): Promise<Point[]> => {
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
      if (!response.ok) throw new Error("Failed to fetch SVG");
      const svgText = await response.text();

      const { paths, viewBox, svg, cleanup: cleanupFn } = parseSvgPaths(svgText);
      cleanup = cleanupFn;
      if (paths.length === 0) throw new Error("No paths found in SVG");

      const outlineCount = Math.floor(count * 0.85);
      const interiorCount = count - outlineCount;

      const outlinePoints = samplePointsFromPaths(paths, outlineCount);
      if (outlinePoints.length === 0) throw new Error("Failed to sample outline points");

      let interiorPoints: Point[] = [];
      try {
        interiorPoints = await samplePointsInFillFromPaths(paths, viewBox, interiorCount, svg);
        if (interiorPoints.length < interiorCount) {
          const additionalOutline = samplePointsFromPaths(
            paths,
            interiorCount - interiorPoints.length
          );
          interiorPoints = interiorPoints.concat(additionalOutline);
        }
      } catch (error) {
        console.warn("Interior sampling failed, using outline only:", error);
        const additionalOutline = samplePointsFromPaths(paths, interiorCount);
        interiorPoints = additionalOutline;
      }

      const sampledPoints = outlinePoints.concat(interiorPoints);
      const fittedPoints = fitPointsToRect(sampledPoints, viewBox, targetWidth, targetHeight, 0);
      
      const targetPoints = fittedPoints.map(p => ({
        x: p.x + offsetX,
        y: p.y + offsetY,
      }));
      
      return targetPoints;
    } catch (error) {
      console.warn("Failed to load SVG, using fallback:", error);
      const fallbackPoints = generateFallbackPoints(count, targetWidth, targetHeight);
      return fallbackPoints.map(p => ({
        x: p.x + offsetX,
        y: p.y + offsetY,
      }));
    } finally {
      if (cleanup) {
        cleanup();
      }
    }
  };

  const retargetDots = (targetPoints: Point[]) => {
    const dots = dotsRef.current;
    for (let i = 0; i < dots.length; i++) {
      const target = targetPoints[i % targetPoints.length];
      dots[i].home.x = target.x;
      dots[i].home.y = target.y;
      dots[i].vel.x = 0;
      dots[i].vel.y = 0;
    }
    targetPointsRef.current = targetPoints;
  };

  const easeOut = (t: number): number => {
    return 1 - Math.pow(1 - t, 1.8);
  };
  
  const easeInOutCubic = (t: number): number => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const easeOutQuad = (t: number): number => {
    return 1 - (1 - t) * (1 - t);
  };

  const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const updatePhysics = (dt: number, time: number, timestamp: number) => {
    const dots = dotsRef.current;
    const startTs = startTsRef.current;
    const phase = phaseRef.current;

    let snapProgress = 0;
    let transitionProgress = 0;

    if (startTs !== null) {
      const elapsed = timestamp - startTs;
      
      if (phase === "snap") {
        snapProgress = clamp(elapsed / durationMs, 0, 1);
        if (snapProgress >= 1) {
          phaseRef.current = "transition";
          transitionProgressRef.current = 0;
        }
      } else if (phase === "transition") {
        snapProgress = 1;
        const transitionElapsed = elapsed - durationMs;
        transitionProgress = clamp(transitionElapsed / transitionDurationMs, 0, 1);
        transitionProgressRef.current = transitionProgress;
        if (transitionProgress >= 1) {
          phaseRef.current = "breathe";
        }
      } else {
        snapProgress = 1;
        transitionProgress = 1;
      }
    }
    snapProgressRef.current = snapProgress;

    const globalOscillatorX = Math.cos(time * 0.3);
    const globalOscillatorY = Math.sin(time * 0.3 + Math.PI / 4);

    const easedSnapProgress = easeInOutCubic(snapProgress);
    const easedTransitionProgress = easeOutQuad(transitionProgress);

    for (const dot of dots) {
      if (phase === "snap") {
        // SNAP PHASE: Lerp from start to home
        dot.pos.x = lerp(dot.startPos.x, dot.home.x, easedSnapProgress);
        dot.pos.y = lerp(dot.startPos.y, dot.home.y, easedSnapProgress);
        dot.vel.x = 0;
        dot.vel.y = 0;
      } else if (phase === "transition") {
        // TRANSITION PHASE: Gradually introduce breathing movement
        const dx = dot.home.x - dot.pos.x;
        const dy = dot.home.y - dot.pos.y;

        // Gradually reduce stiffness and increase noise over the transition
        const stiffness = dot.baseStiffness * lerp(2.0, 0.3, easedTransitionProgress);
        const noiseAmp = dot.baseNoiseAmp * lerp(0.0, 1.5, easedTransitionProgress);
        const damping = dot.baseDamping;

        let fx = stiffness * dx;
        let fy = stiffness * dy;

        // Gradually introduce noise
        if (dot.coordinatedPhase) {
          const coordAmp = noiseAmp * 0.8;
          fx += globalOscillatorX * coordAmp;
          fy += globalOscillatorY * coordAmp;
          
          const individualVariation = noiseAmp * 0.3;
          const noise = generateNoise(time * dot.noiseFreq * 0.5, dot.seedA, dot.seedB);
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
        // BREATHING PHASE: Full spring physics with noise
        const dx = dot.home.x - dot.pos.x;
        const dy = dot.home.y - dot.pos.y;

        const stiffness = dot.baseStiffness * 0.3;
        const noiseAmp = dot.baseNoiseAmp * 1.5;
        const damping = dot.baseDamping;

        let fx = stiffness * dx;
        let fy = stiffness * dy;

        if (dot.coordinatedPhase) {
          const coordAmp = noiseAmp * 0.8;
          fx += globalOscillatorX * coordAmp;
          fy += globalOscillatorY * coordAmp;
          
          const individualVariation = noiseAmp * 0.3;
          const noise = generateNoise(time * dot.noiseFreq * 0.5, dot.seedA, dot.seedB);
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
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 161, g: 161, b: 170 };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    const dots = dotsRef.current;
    const SETTLED_PX = 1.25;
    const grayRgb = hexToRgb("#A1A1AA");
    const orangeRgb = hexToRgb("#00A452");

    const time = timeRef.current;
    const SWAY_FREQ = 0.35;
    const phase = phaseRef.current;
    const isBreathingOrTransition = phase === "breathe" || phase === "transition";

    for (const dot of dots) {
      if (dot.pos.x < -50 || dot.pos.x > width + 50 || 
          dot.pos.y < -50 || dot.pos.y > height + 50) {
        continue;
      }

      const dx = dot.pos.x - dot.home.x;
      const dy = dot.pos.y - dot.home.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const t = Math.min(dist / SETTLED_PX, 1);
      const easedT = easeOut(1 - t);
      
      const r = lerp(grayRgb.r, orangeRgb.r, easedT);
      const g = lerp(grayRgb.g, orangeRgb.g, easedT);
      const b = lerp(grayRgb.b, orangeRgb.b, easedT);
      ctx.fillStyle = rgbToHex(r, g, b);

      let swayX: number;
      let swayY: number;
      
      // Gradually introduce sway during transition
      let swayMultiplier = 1;
      if (phase === "snap") {
        swayMultiplier = 0;
      } else if (phase === "transition") {
        swayMultiplier = easeOutQuad(transitionProgressRef.current);
      }
      
      if (isBreathingOrTransition && dot.coordinatedPhase) {
        const globalPhase = time * 0.3;
        swayX = Math.sin(globalPhase + dot.swayPhase * 0.5) * dot.swayAmp * swayMultiplier;
        swayY = Math.cos(globalPhase + dot.swayPhase * 0.7) * dot.swayAmp * swayMultiplier;
      } else {
        swayX = Math.sin(time * SWAY_FREQ + dot.swayPhase) * dot.swayAmp * swayMultiplier;
        swayY = Math.cos(time * SWAY_FREQ + dot.swayPhase * 1.3) * dot.swayAmp * swayMultiplier;
      }

      const drawX = dot.pos.x + swayX;
      const drawY = dot.pos.y + swayY;

      if (drawX >= -dot.radius && drawX <= width + dot.radius &&
          drawY >= -dot.radius && drawY <= height + dot.radius) {
        ctx.beginPath();
        ctx.arc(drawX, drawY, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const animate = (timestamp: number) => {
    if (prefersReducedMotionRef.current) {
      const dots = dotsRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#A1A1AA";

      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.home.x, dot.home.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (startTsRef.current === null) {
      startTsRef.current = timestamp;
      phaseRef.current = "snap";
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }

    const rawDt = (timestamp - lastTimeRef.current) / 1000;
    const dt = Math.min(rawDt, 0.033);
    lastTimeRef.current = timestamp;

    const time = timestamp / 1000;
    timeRef.current = time;

    updatePhysics(dt, time, timestamp);
    draw();

    rafIdRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const container = containerRef.current;
    if (!container) return;

    const size = setupCanvas();
    if (!size) return;

    loadTargetsOnly(size.width, size.height).then((targetPoints) => {
      targetPointsRef.current = targetPoints;
      initializeDots(targetPoints, size.width, size.height);

      if (prefersReducedMotionRef.current) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dots = dotsRef.current;
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#A1A1AA";
        for (const dot of dots) {
          ctx.beginPath();
          ctx.arc(dot.home.x, dot.home.y, dot.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        startTsRef.current = null;
        phaseRef.current = "snap";
        lastTimeRef.current = null;
        rafIdRef.current = requestAnimationFrame(animate);
      }
    });

    const stopResize = observeResize(container, () => {
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }

      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;

        const newSize = setupCanvas();
        if (!newSize) return;

        if (dotsRef.current.length !== count) {
          loadTargetsOnly(newSize.width, newSize.height).then((targetPoints) => {
            targetPointsRef.current = targetPoints;
            initializeDots(targetPoints, newSize.width, newSize.height);
            if (!prefersReducedMotionRef.current && rafIdRef.current === null) {
              startTsRef.current = null;
              phaseRef.current = "snap";
              lastTimeRef.current = null;
              rafIdRef.current = requestAnimationFrame(animate);
            }
          });
          return;
        }

        loadTargetsOnly(newSize.width, newSize.height).then((targetPoints) => {
          retargetDots(targetPoints);
        });
      });
    });

    return () => {
      stopResize();
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [svgUrl, count, dotRadius, spread, durationMs, targetWidth, targetHeight, targetAnchor]);

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}