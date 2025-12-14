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

type Props = {
  svgUrl?: string;
  count?: number;
  dotRadius?: number;
  spread?: number;
  durationMs?: number;
  className?: string;
};

interface Dot {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  home: { x: number; y: number };
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

export default function HeroDots({
  svgUrl = "/assets/2.svg",
  count = 1700,
  dotRadius = 1.8,
  spread = 0.9,
  durationMs = 3000,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const targetPointsRef = useRef<Point[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const phaseRef = useRef<"snap" | "breathe">("snap");
  const snapProgressRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef(false);
  const resizeRafRef = useRef<number | null>(null);

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

      const radiusVariation = 0.6 + r3 * 0.8; // 0.6-1.4 (larger variation)
      const swayPhase = r8 * Math.PI * 2;
      const swayAmp = 1.2 + r9 * 1.4; // 0.8-2.2px (stronger sway)
      const target = targetPoints[i % targetPoints.length];
      const home = { x: target.x, y: target.y };
      
      // Start dots near their target positions with small random offset
      const offsetDistance = Math.min(width, height) * 0.15; // Small offset from target
      const angle = r1 * Math.PI * 2;
      const distance = r2 * offsetDistance;
      const pos = {
        x: target.x + Math.cos(angle) * distance,
        y: target.y + Math.sin(angle) * distance,
      };

      const profileType = i % 10;
      let baseStiffness: number;
      let baseDamping: number;
      let baseNoiseAmp: number;
      let noiseFreq: number;

      if (profileType < 7) {
        // 70% stable dots: higher stiffness, lower noise
        baseStiffness = 8.0 + r4 * 6.0; // Increased for faster convergence
        baseDamping = 0.90 + r5 * 0.04;
        baseNoiseAmp = 0.4 + r6 * 0.8;
        noiseFreq = 0.4 + r7 * 0.2;
      } else if (profileType < 9) {
        // 20% jitter dots: medium stiffness, medium noise
        baseStiffness = 5.0 + r4 * 4.0; // Increased for faster convergence
        baseDamping = 0.88 + r5 * 0.06;
        baseNoiseAmp = 1.0 + r6 * 1.4;
        noiseFreq = 0.6 + r7 * 0.3;
      } else {
        // 10% floaters: low stiffness, higher noise, slightly lower damping
        baseStiffness = 3.0 + r4 * 3.0; // Increased for faster convergence
        baseDamping = 0.82 + r5 * 0.06;
        baseNoiseAmp = 1.5 + r6 * 1.7;
        noiseFreq = 0.5 + r7 * 0.4;
      }

      dots.push({
        pos,
        vel: { x: 0, y: 0 },
        home,
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
      });
    }

    dotsRef.current = dots;
  };

  const loadTargetsOnly = async (width: number, height: number): Promise<Point[]> => {
    let cleanup: (() => void) | null = null;
    try {
      const response = await fetch(svgUrl);
      if (!response.ok) throw new Error("Failed to fetch SVG");
      const svgText = await response.text();

      const { paths, viewBox, svg, cleanup: cleanupFn } = parseSvgPaths(svgText);
      cleanup = cleanupFn;
      if (paths.length === 0) throw new Error("No paths found in SVG");

      // Split dots: 85% outline, 15% interior
      const outlineCount = Math.floor(count * 0.85);
      const interiorCount = count - outlineCount;

      // Sample outline points
      const outlinePoints = samplePointsFromPaths(paths, outlineCount);
      if (outlinePoints.length === 0) throw new Error("Failed to sample outline points");

      // Sample interior points (with fallback to outline if it fails)
      let interiorPoints: Point[] = [];
      try {
        interiorPoints = await samplePointsInFillFromPaths(paths, viewBox, interiorCount, svg);
        // If we didn't get enough interior points, fill the rest with outline
        if (interiorPoints.length < interiorCount) {
          const additionalOutline = samplePointsFromPaths(
            paths,
            interiorCount - interiorPoints.length
          );
          interiorPoints = interiorPoints.concat(additionalOutline);
        }
      } catch (error) {
        // Fallback to outline-only if interior sampling fails
        console.warn("Interior sampling failed, using outline only:", error);
        const additionalOutline = samplePointsFromPaths(paths, interiorCount);
        interiorPoints = additionalOutline;
      }

      // Merge outline and interior points
      const sampledPoints = outlinePoints.concat(interiorPoints);

      const targetPoints = fitPointsToRect(sampledPoints, viewBox, width, height, 0);
      return targetPoints;
    } catch (error) {
      console.warn("Failed to load SVG, using fallback:", error);
      const fallbackPoints = generateFallbackPoints(count, width, height);
      return fallbackPoints;
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
      // Zero velocity to prevent "fling" after resize
      dots[i].vel.x = 0;
      dots[i].vel.y = 0;
    }
    targetPointsRef.current = targetPoints;
  };

  const easeOut = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const updatePhysics = (dt: number, time: number, timestamp: number) => {
    const dots = dotsRef.current;
    const startTs = startTsRef.current;
    const phase = phaseRef.current;

    // Determine phase and snap progress
    let snapProgress = 0;
    let isSnapping = false;
    if (startTs !== null && phase === "snap") {
      const elapsed = timestamp - startTs;
      snapProgress = clamp(elapsed / durationMs, 0, 1);
      isSnapping = snapProgress < 1;
      if (!isSnapping && phase === "snap") {
        phaseRef.current = "breathe";
      }
    }
    snapProgressRef.current = snapProgress;

    for (const dot of dots) {
      const dx = dot.home.x - dot.pos.x;
      const dy = dot.home.y - dot.pos.y;

      // Snap phase: boost stiffness and reduce noise
      let stiffness = dot.baseStiffness * dot.stiffnessMult;
      let noiseAmp = dot.baseNoiseAmp * dot.noiseMult;
      
      if (isSnapping) {
        const stiffnessBoost = 1 + (12 - 1) * (1 - easeOut(snapProgress));
        stiffness *= stiffnessBoost;
        noiseAmp *= (1 - snapProgress) * 0.1;
      }

      const damping = dot.baseDamping;

      // Spring force toward home
      let fx = stiffness * dx;
      let fy = stiffness * dy;

      // Noise (reduced during snap)
      const noise = generateNoise(time * dot.noiseFreq, dot.seedA, dot.seedB);
      fx += noise.x * noiseAmp;
      fy += noise.y * noiseAmp;

      // Direct pull during early snap (first ~200ms)
      if (isSnapping && snapProgress < 0.17) {
        const pullStrength = 0.12 * easeOut(snapProgress);
        dot.pos.x += dx * pullStrength;
        dot.pos.y += dy * pullStrength;
      }

      // Reset multipliers to base values
      dot.stiffnessMult = 1;
      dot.noiseMult = 1;

      // Semi-implicit Euler with damping as multiplier
      dot.vel.x = (dot.vel.x + fx * dt) * damping;
      dot.vel.y = (dot.vel.y + fy * dt) * damping;
      dot.pos.x += dot.vel.x * dt;
      dot.pos.y += dot.vel.y * dt;
    }
  };

  const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
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
    const orangeRgb = hexToRgb("#E29E5B");

    const time = timeRef.current;
    const SWAY_FREQ = 0.4; // Sway frequency (slightly faster for more visible motion)

    for (const dot of dots) {
      // Calculate distance to home (using actual pos, not swayed)
      const dx = dot.pos.x - dot.home.x;
      const dy = dot.pos.y - dot.home.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Color based on distance to home
      const t = Math.min(dist / SETTLED_PX, 1);
      const easedT = easeOut(1 - t); // Invert so closer = more orange
      
      const r = lerp(grayRgb.r, orangeRgb.r, easedT);
      const g = lerp(grayRgb.g, orangeRgb.g, easedT);
      const b = lerp(grayRgb.b, orangeRgb.b, easedT);
      ctx.fillStyle = rgbToHex(r, g, b);

      // Calculate sway offset
      const swayX = Math.sin(time * SWAY_FREQ + dot.swayPhase) * dot.swayAmp;
      const swayY = Math.cos(time * SWAY_FREQ + dot.swayPhase * 1.3) * dot.swayAmp;

      // Clamp drawing position to canvas bounds (accounting for dot radius)
      const drawX = Math.max(dot.radius, Math.min(width - dot.radius, dot.pos.x + swayX));
      const drawY = Math.max(dot.radius, Math.min(height - dot.radius, dot.pos.y + swayY));

      ctx.beginPath();
      ctx.arc(drawX, drawY, dot.radius, 0, Math.PI * 2);
      ctx.fill();
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

    // Initialize start time on first frame
    if (startTsRef.current === null) {
      startTsRef.current = timestamp;
      phaseRef.current = "snap";
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }

    // Cap dt for stability
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

    // Initial mount: load targets and initialize dots
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

    // Resize handler with debouncing
    const stopResize = observeResize(container, () => {
      // Cancel pending resize
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }

      // Debounce resize using requestAnimationFrame
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;

        const newSize = setupCanvas();
        if (!newSize) return;

        // Check if count changed - if so, reinitialize
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

        // Normal resize: retarget existing dots
        loadTargetsOnly(newSize.width, newSize.height).then((targetPoints) => {
          retargetDots(targetPoints);
          // Do NOT restart RAF if already running
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
  }, [svgUrl, count, dotRadius, spread, durationMs]);

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
