"use client";

import React, { useEffect, useRef } from "react";
import {
  parseSvgPaths,
  samplePointsFromPaths,
  fitPointsToRect,
  type Point,
  type ViewBox,
} from "@/lib/motion/svgSample";
import { lerp } from "@/motion/math";
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
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  radius: number;
  delay: number;
}

function cubicEaseOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
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
  count = 1200,
  dotRadius = 1.5,
  spread = 0.9,
  durationMs = 1200,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const targetPointsRef = useRef<Point[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prefersReducedMotionRef = useRef(false);

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

    ctx.scale(dpr, dpr);

    return { width, height, dpr };
  };

  const initializeDots = (targetPoints: Point[], width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxSpread = Math.min(width, height) * spread * 0.5;

    const dots: Dot[] = [];
    for (let i = 0; i < count; i++) {
      const target = targetPoints[i % targetPoints.length];
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxSpread;
      const radiusVariation = 0.8 + Math.random() * 0.4;

      dots.push({
        startX: centerX + Math.cos(angle) * distance,
        startY: centerY + Math.sin(angle) * distance,
        targetX: target.x,
        targetY: target.y,
        radius: dotRadius * radiusVariation,
        delay: Math.random() * 150,
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

  const draw = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    const dots = dotsRef.current;
    const now = t;
    const color = "#A1A1AA";

    ctx.fillStyle = color;

    for (const dot of dots) {
      const elapsed = Math.max(0, now - dot.delay);
      const progress = Math.min(1, elapsed / durationMs);
      const eased = cubicEaseOut(progress);

      const x = lerp(dot.startX, dot.targetX, eased);
      const y = lerp(dot.startY, dot.targetY, eased);

      ctx.beginPath();
      ctx.arc(x, y, dot.radius, 0, Math.PI * 2);
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
        ctx.arc(dot.targetX, dot.targetY, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    draw(elapsed);

    if (elapsed < durationMs + 150) {
      rafIdRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const container = containerRef.current;
    if (!container) return;

    const size = setupCanvas();
    if (!size) return;

    loadAndSampleSvg(size.width, size.height).then(() => {
      if (prefersReducedMotionRef.current) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dots = dotsRef.current;
        ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        ctx.fillStyle = "#A1A1AA";
        for (const dot of dots) {
          ctx.beginPath();
          ctx.arc(dot.targetX, dot.targetY, dot.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        startTimeRef.current = null;
        rafIdRef.current = requestAnimationFrame(animate);
      }
    });

    const stopResize = observeResize(container, () => {
      const newSize = setupCanvas();
      if (newSize) {
        loadAndSampleSvg(newSize.width, newSize.height).then(() => {
          if (!prefersReducedMotionRef.current) {
            startTimeRef.current = null;
            if (rafIdRef.current) {
              cancelAnimationFrame(rafIdRef.current);
            }
            rafIdRef.current = requestAnimationFrame(animate);
          }
        });
      }
    });

    return () => {
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

