"use client";

import type { Point } from "@/lib/motion/svgSample";
import { hashStringToSeed, makeMulberry32 } from "@/lib/motion/random";

// Re-export for backwards compatibility with existing imports
export { hashStringToSeed, makeMulberry32 };

export function generateScatterTargets(
  sceneId: string,
  width: number,
  height: number,
  dotCount: number
): Point[] {
  const seed = hashStringToSeed(sceneId);
  const rand = makeMulberry32(seed);
  const points: Point[] = new Array(dotCount);

  const noiseFreq = 0.013;
  const noiseAmp = Math.min(width, height) * 0.03;
  const phaseA = rand() * Math.PI * 2;
  const phaseB = rand() * Math.PI * 2;

  for (let i = 0; i < dotCount; i++) {
    const x0 = rand() * width;
    const y0 = rand() * height;

    const nX = Math.sin(x0 * noiseFreq + y0 * noiseFreq * 0.7 + phaseA);
    const nY = Math.cos(x0 * noiseFreq * 0.8 + y0 * noiseFreq + phaseB);

    const x = Math.max(0, Math.min(width, x0 + nX * noiseAmp));
    const y = Math.max(0, Math.min(height, y0 + nY * noiseAmp));

    points[i] = { x, y };
  }

  return points;
}

export function generateDissipateTargets(
  sceneId: string,
  width: number,
  height: number,
  dotCount: number
): Point[] {
  const seed = hashStringToSeed(sceneId);
  const rand = makeMulberry32(seed);
  const points: Point[] = new Array(dotCount);

  const perimeter = 2 * (width + height);
  const jitterT = Math.min(width, height) * 0.02;
  const jitterOut = Math.min(width, height) * 0.01;

  for (let i = 0; i < dotCount; i++) {
    const t0 = ((i + 0.5) / dotCount) * perimeter;
    const j = (rand() - 0.5) * jitterT;
    const out = (rand() - 0.2) * jitterOut;
    const t = (t0 + j + perimeter) % perimeter;

    let x = 0;
    let y = 0;
    let nx = 0;
    let ny = 0;

    if (t < width) {
      x = t;
      y = -out;
      nx = 0;
      ny = -1;
    } else if (t < width + height) {
      x = width + out;
      y = t - width;
      nx = 1;
      ny = 0;
    } else if (t < width + height + width) {
      x = width - (t - (width + height));
      y = height + out;
      nx = 0;
      ny = 1;
    } else {
      x = -out;
      y = height - (t - (width + height + width));
      nx = -1;
      ny = 0;
    }

    points[i] = { x: x + nx * out, y: y + ny * out };
  }

  return points;
}

