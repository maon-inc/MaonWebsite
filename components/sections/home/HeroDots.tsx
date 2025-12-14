"use client";

import React, { useEffect, useRef } from "react";
import {
  parseSvgPaths,
  samplePointsFromPaths,
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
  svgUrl = "/assets/hero_svg.svg",
  count = 1500,
  dotRadius = 1.8,
  spread = 0.9,
  durationMs = 2500,
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
  const prefersReducedMotionRef = useRef(false);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const isHoveringRef = useRef(false);

  const HOVER_RADIUS = 160;
  const REPULSION_STRENGTH = 1000;
  const STIFFNESS_REDUCTION = 0.3;
  const NOISE_INCREASE = 2.5;
  const RECOVERY_RATE = 0.15;

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
    const centerX = width / 2;
    const centerY = height / 2;
    const maxSpread = Math.min(width, height) * spread * 0.5;

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

      const radiusVariation = 0.8 + r3 * 0.4;
      const target = targetPoints[i % targetPoints.length];
      const angle = r1 * Math.PI * 2;
      const distance = r2 * maxSpread;
      const pos = {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
      };
      const home = { x: target.x, y: target.y };

      const profileType = i % 10;
      let baseStiffness: number;
      let baseDamping: number;
      let baseNoiseAmp: number;
      let noiseFreq: number;

      if (profileType < 7) {
        // 70% stable dots: higher stiffness, lower noise
        baseStiffness = 2.5 + r4 * 3.0;
        baseDamping = 0.90 + r5 * 0.04;
        baseNoiseAmp = 0.4 + r6 * 0.8;
        noiseFreq = 0.4 + r7 * 0.2;
      } else if (profileType < 9) {
        // 20% jitter dots: medium stiffness, medium noise
        baseStiffness = 1.6 + r4 * 2.2;
        baseDamping = 0.88 + r5 * 0.06;
        baseNoiseAmp = 1.0 + r6 * 1.4;
        noiseFreq = 0.6 + r7 * 0.3;
      } else {
        // 10% floaters: low stiffness, higher noise, slightly lower damping
        baseStiffness = 0.8 + r4 * 1.4;
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
      });
    }

    dotsRef.current = dots;
  };

  const loadAndSampleSvg = async (width: number, height: number) => {
    try {
      const response = await fetch(svgUrl);
      if (!response.ok) throw new Error("Failed to fetch SVG");
      const svgText = await response.text();

      const { paths, viewBox } = parseSvgPaths(svgText);
      if (paths.length === 0) throw new Error("No paths found in SVG");

      const sampledPoints = samplePointsFromPaths(paths, count);
      if (sampledPoints.length === 0) throw new Error("Failed to sample points");

      const targetPoints = fitPointsToRect(sampledPoints, viewBox, width, height, 0);
      targetPointsRef.current = targetPoints;
      initializeDots(targetPoints, width, height);
    } catch (error) {
      console.warn("Failed to load SVG, using fallback:", error);
      const fallbackPoints = generateFallbackPoints(count, width, height);
      targetPointsRef.current = fallbackPoints;
      initializeDots(fallbackPoints, width, height);
    }
  };

  const easeOut = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const updatePhysics = (dt: number, time: number, timestamp: number) => {
    const dots = dotsRef.current;
    const mousePos = mousePosRef.current;
    const isHovering = isHoveringRef.current;
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

      // Hover interaction (breathe phase only, or during snap if hovering)
      if (mousePos && isHovering) {
        const mx = mousePos.x;
        const my = mousePos.y;
        const distX = dot.pos.x - mx;
        const distY = dot.pos.y - my;
        const distSq = distX * distX + distY * distY;
        const dist = Math.sqrt(distSq);

        if (dist < HOVER_RADIUS && dist > 0) {
          const t = dist / HOVER_RADIUS;
          const falloff = (1 - t) * (1 - t);
          const repulsion = REPULSION_STRENGTH * falloff;

          const invDist = 1 / dist;
          fx += (distX * invDist) * repulsion;
          fy += (distY * invDist) * repulsion;

          const influence = 1 - t;
          dot.stiffnessMult = Math.max(
            dot.stiffnessMult - RECOVERY_RATE * dt * 60,
            1 - STIFFNESS_REDUCTION * influence
          );
          dot.noiseMult = Math.min(
            dot.noiseMult + RECOVERY_RATE * dt * 60,
            1 + NOISE_INCREASE * influence
          );
        } else {
          dot.stiffnessMult = Math.min(dot.stiffnessMult + RECOVERY_RATE * dt * 60, 1);
          dot.noiseMult = Math.max(dot.noiseMult - RECOVERY_RATE * dt * 60, 1);
        }
      } else {
        dot.stiffnessMult = Math.min(dot.stiffnessMult + RECOVERY_RATE * dt * 60, 1);
        dot.noiseMult = Math.max(dot.noiseMult - RECOVERY_RATE * dt * 60, 1);
      }

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

    for (const dot of dots) {
      // Calculate distance to home
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

      ctx.beginPath();
      ctx.arc(dot.pos.x, dot.pos.y, dot.radius, 0, Math.PI * 2);
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      isHoveringRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      mousePosRef.current = null;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    loadAndSampleSvg(size.width, size.height).then(() => {
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
      const newSize = setupCanvas();
      if (newSize) {
        loadAndSampleSvg(newSize.width, newSize.height).then(() => {
          if (!prefersReducedMotionRef.current) {
            startTsRef.current = null;
            phaseRef.current = "snap";
            lastTimeRef.current = null;
            if (rafIdRef.current) {
              cancelAnimationFrame(rafIdRef.current);
            }
            rafIdRef.current = requestAnimationFrame(animate);
          }
        });
      }
    });

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      stopResize();
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
