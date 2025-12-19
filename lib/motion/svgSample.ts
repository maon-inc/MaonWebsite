/**
 * SVG sampling utilities
 * Parse SVG text and sample points from paths
 */

import { hashStringToSeed, makeMulberry32 } from "./random";

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ParseResult {
  svg: SVGSVGElement;
  paths: SVGPathElement[];
  viewBox: ViewBox;
  cleanup: () => void;
}

export function parseSvgPaths(svgText: string): ParseResult {
  const container = document.createElement("div");
  container.innerHTML = svgText;
  container.style.position = "absolute";
  container.style.visibility = "hidden";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const svg = container.querySelector("svg");
  if (!svg) {
    document.body.removeChild(container);
    throw new Error("No <svg> element found in SVG text");
  }

  const paths = Array.from(svg.querySelectorAll("path"));

  let viewBox: ViewBox;
  if (svg.viewBox && svg.viewBox.baseVal) {
    const vb = svg.viewBox.baseVal;
    viewBox = { x: vb.x, y: vb.y, w: vb.width, h: vb.height };
  } else {
    const width = parseFloat(svg.getAttribute("width") || "100");
    const height = parseFloat(svg.getAttribute("height") || "100");
    viewBox = { x: 0, y: 0, w: width, h: height };
  }

  const cleanup = () => {
    if (container.parentNode === document.body) {
      document.body.removeChild(container);
    }
  };

  return { svg, paths, viewBox, cleanup };
}

export function samplePointsFromPaths(
  paths: SVGPathElement[],
  count: number,
  rng: () => number = Math.random
): Point[] {
  if (paths.length === 0) return [];

  const lengths = paths.map((path) => {
    try {
      return path.getTotalLength();
    } catch {
      return 0;
    }
  });

  const totalLength = lengths.reduce((sum, len) => sum + len, 0);
  if (totalLength === 0) return [];

  const counts: number[] = [];
  let allocated = 0;

  for (let i = 0; i < lengths.length; i++) {
    const proportion = lengths[i] / totalLength;
    const allocatedForPath = Math.floor(proportion * count);
    counts[i] = allocatedForPath;
    allocated += allocatedForPath;
  }

  const remaining = count - allocated;
  if (remaining > 0) {
    for (let i = 0; i < remaining; i++) {
      counts[i % counts.length]++;
    }
  }

  const points: Point[] = [];

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const pathCount = counts[i];
    const pathLength = lengths[i];

    if (pathCount === 0 || pathLength === 0) continue;

    // Stratified jitter sampling: divide path into segments and add jitter
    // Avoid exact endpoints by keeping samples away from 0 and pathLength
    const margin = Math.min(pathLength * 0.01, 1.0); // 1% margin or 1px, whichever is smaller
    const usableLength = pathLength - 2 * margin;
    
    if (usableLength <= 0) {
      // Path too short, sample at midpoint
      try {
        const point = path.getPointAtLength(pathLength * 0.5);
        points.push({ x: point.x, y: point.y });
      } catch {
        // Skip invalid points
      }
      continue;
    }

    const segmentSize = usableLength / pathCount;
    for (let j = 0; j < pathCount; j++) {
      const segmentStart = margin + j * segmentSize;
      const jitter = (rng() - 0.5) * segmentSize * 0.8; // 80% jitter within segment
      const length = segmentStart + segmentSize * 0.5 + jitter;
      
      try {
        const point = path.getPointAtLength(length);
        points.push({ x: point.x, y: point.y });
      } catch {
        // Skip invalid points
      }
    }
  }

  return points;
}

export async function samplePointsInFillFromPaths(
  paths: SVGPathElement[],
  viewBox: ViewBox,
  count: number,
  svgElement: SVGSVGElement,
  rng: () => number = Math.random
): Promise<Point[]> {
  if (paths.length === 0) return [];

  const RASTER_WIDTH = 500;
  const RASTER_HEIGHT = Math.round((RASTER_WIDTH / viewBox.w) * viewBox.h);
  const ALPHA_THRESHOLD = 128;

  // Create offscreen canvas for rasterization
  const canvas = document.createElement("canvas");
  canvas.width = RASTER_WIDTH;
  canvas.height = RASTER_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  // Create SVG blob URL
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    // Load SVG as image
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = svgUrl;
    });

    // Render SVG to canvas
    ctx.clearRect(0, 0, RASTER_WIDTH, RASTER_HEIGHT);
    ctx.drawImage(img, 0, 0, RASTER_WIDTH, RASTER_HEIGHT);

    // Read pixel data
    const imageData = ctx.getImageData(0, 0, RASTER_WIDTH, RASTER_HEIGHT);
    const data = imageData.data;

    // Collect all filled pixel coordinates
    const filledPixels: { x: number; y: number }[] = [];
    for (let y = 0; y < RASTER_HEIGHT; y++) {
      for (let x = 0; x < RASTER_WIDTH; x++) {
        const idx = (y * RASTER_WIDTH + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > ALPHA_THRESHOLD) {
          filledPixels.push({ x, y });
        }
      }
    }

    if (filledPixels.length === 0) return [];

    // Sample random points from filled pixels
    const points: Point[] = [];
    const pixelCount = filledPixels.length;
    const samplesNeeded = Math.min(count, pixelCount);

    // Use shuffled indices for random sampling
    const indices: number[] = [];
    for (let i = 0; i < pixelCount; i++) {
      indices.push(i);
    }
    
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Convert pixel coordinates to SVG coordinate space
    const scaleX = viewBox.w / RASTER_WIDTH;
    const scaleY = viewBox.h / RASTER_HEIGHT;

    for (let i = 0; i < samplesNeeded; i++) {
      const pixel = filledPixels[indices[i]];
      points.push({
        x: viewBox.x + pixel.x * scaleX,
        y: viewBox.y + pixel.y * scaleY,
      });
    }

    return points;
  } catch (error) {
    console.warn("Raster-based fill sampling failed:", error);
    return [];
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export function fitPointsToRect(
  points: Point[],
  viewBox: ViewBox,
  rectW: number,
  rectH: number,
  paddingPx: number
): Point[] {
  const availableW = rectW - 2 * paddingPx;
  const availableH = rectH - 2 * paddingPx;

  const scaleX = availableW / viewBox.w;
  const scaleY = availableH / viewBox.h;
  const scale = Math.min(scaleX, scaleY);

  const scaledW = viewBox.w * scale;
  const scaledH = viewBox.h * scale;

  const offsetX = (rectW - scaledW) / 2;
  const offsetY = (rectH - scaledH) / 2;

  return points.map((point) => ({
    x: (point.x - viewBox.x) * scale + offsetX,
    y: (point.y - viewBox.y) * scale + offsetY,
  }));
}

type ParsedSvgEntry = {
  svg: SVGSVGElement;
  paths: SVGPathElement[];
  viewBox: ViewBox;
  container: HTMLDivElement;
};

const parsedSvgCache = new Map<string, Promise<ParsedSvgEntry>>();
const fittedPointsCache = new Map<string, Promise<Point[]>>();
const MAX_PARSED_SVGS = 32;
const parsedSvgEvictionQueue: string[] = [];

/**
 * Cleanup all cached SVG DOM elements and clear caches.
 * Call this on page navigation or component unmount to prevent memory leaks.
 */
export function clearSvgCaches(): void {
  // Clean up all DOM containers
  for (const promise of parsedSvgCache.values()) {
    promise
      .then((entry) => {
        if (entry.container.parentNode) {
          entry.container.parentNode.removeChild(entry.container);
        }
      })
      .catch(() => undefined);
  }
  
  parsedSvgCache.clear();
  fittedPointsCache.clear();
  parsedSvgEvictionQueue.length = 0;
}

/**
 * Style attributes to copy from shape elements to their path equivalents
 */
const STYLE_ATTRS = ["fill", "stroke", "stroke-width", "opacity", "fill-opacity", "stroke-opacity"];

/**
 * Copy style attributes from one SVG element to another
 */
function copyStyleAttributes(from: SVGElement, to: SVGElement): void {
  for (const attr of STYLE_ATTRS) {
    const value = from.getAttribute(attr);
    if (value) to.setAttribute(attr, value);
  }
}

/**
 * Convert a <circle> element to an equivalent <path> element
 */
function circleToPath(circle: SVGCircleElement, svg: SVGSVGElement): SVGPathElement {
  const cx = parseFloat(circle.getAttribute("cx") || "0");
  const cy = parseFloat(circle.getAttribute("cy") || "0");
  const r = parseFloat(circle.getAttribute("r") || "0");

  // Create a circle path using two arc commands
  // M cx-r, cy  (move to left point)
  // A r,r 0 1,0 cx+r,cy (arc to right point)
  // A r,r 0 1,0 cx-r,cy (arc back to left point)
  const d = `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  copyStyleAttributes(circle, path);

  svg.appendChild(path);
  return path;
}

/**
 * Convert an <ellipse> element to an equivalent <path> element
 */
function ellipseToPath(ellipse: SVGEllipseElement, svg: SVGSVGElement): SVGPathElement {
  const cx = parseFloat(ellipse.getAttribute("cx") || "0");
  const cy = parseFloat(ellipse.getAttribute("cy") || "0");
  const rx = parseFloat(ellipse.getAttribute("rx") || "0");
  const ry = parseFloat(ellipse.getAttribute("ry") || "0");

  const d = `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy}`;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  copyStyleAttributes(ellipse, path);

  svg.appendChild(path);
  return path;
}

/**
 * Convert a <rect> element to an equivalent <path> element
 */
function rectToPath(rect: SVGRectElement, svg: SVGSVGElement): SVGPathElement {
  const x = parseFloat(rect.getAttribute("x") || "0");
  const y = parseFloat(rect.getAttribute("y") || "0");
  const w = parseFloat(rect.getAttribute("width") || "0");
  const h = parseFloat(rect.getAttribute("height") || "0");
  const rx = parseFloat(rect.getAttribute("rx") || "0");
  const ry = parseFloat(rect.getAttribute("ry") || rx.toString());

  let d: string;
  if (rx === 0 && ry === 0) {
    // Simple rectangle
    d = `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`;
  } else {
    // Rounded rectangle
    const clampedRx = Math.min(rx, w / 2);
    const clampedRy = Math.min(ry, h / 2);
    d = `M ${x + clampedRx},${y} 
         H ${x + w - clampedRx} 
         A ${clampedRx},${clampedRy} 0 0,1 ${x + w},${y + clampedRy}
         V ${y + h - clampedRy}
         A ${clampedRx},${clampedRy} 0 0,1 ${x + w - clampedRx},${y + h}
         H ${x + clampedRx}
         A ${clampedRx},${clampedRy} 0 0,1 ${x},${y + h - clampedRy}
         V ${y + clampedRy}
         A ${clampedRx},${clampedRy} 0 0,1 ${x + clampedRx},${y}
         Z`;
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  copyStyleAttributes(rect, path);

  svg.appendChild(path);
  return path;
}

/**
 * Convert a <line> element to an equivalent <path> element
 */
function lineToPath(line: SVGLineElement, svg: SVGSVGElement): SVGPathElement {
  const x1 = parseFloat(line.getAttribute("x1") || "0");
  const y1 = parseFloat(line.getAttribute("y1") || "0");
  const x2 = parseFloat(line.getAttribute("x2") || "0");
  const y2 = parseFloat(line.getAttribute("y2") || "0");

  const d = `M ${x1},${y1} L ${x2},${y2}`;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  copyStyleAttributes(line, path);

  svg.appendChild(path);
  return path;
}

/**
 * Convert a <polygon> element to an equivalent <path> element
 */
function polygonToPath(polygon: SVGPolygonElement, svg: SVGSVGElement): SVGPathElement {
  const points = polygon.getAttribute("points") || "";
  const coords = points.trim().split(/[\s,]+/).map(parseFloat);

  if (coords.length < 4) {
    // Not enough points for a polygon
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "");
    return path;
  }

  let d = `M ${coords[0]},${coords[1]}`;
  for (let i = 2; i < coords.length; i += 2) {
    d += ` L ${coords[i]},${coords[i + 1]}`;
  }
  d += " Z";

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  copyStyleAttributes(polygon, path);

  svg.appendChild(path);
  return path;
}

/**
 * Convert a <polyline> element to an equivalent <path> element
 */
function polylineToPath(polyline: SVGPolylineElement, svg: SVGSVGElement): SVGPathElement {
  const points = polyline.getAttribute("points") || "";
  const coords = points.trim().split(/[\s,]+/).map(parseFloat);

  if (coords.length < 4) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "");
    return path;
  }

  let d = `M ${coords[0]},${coords[1]}`;
  for (let i = 2; i < coords.length; i += 2) {
    d += ` L ${coords[i]},${coords[i + 1]}`;
  }
  // No Z - polyline is not closed

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  copyStyleAttributes(polyline, path);

  svg.appendChild(path);
  return path;
}

async function getParsedSvgForUrl(svgUrl: string): Promise<ParsedSvgEntry> {
  const cached = parsedSvgCache.get(svgUrl);
  if (cached) return cached;

  const promise = (async () => {
    const response = await fetch(svgUrl);
    if (!response.ok) throw new Error(`Failed to fetch SVG: ${svgUrl}`);
    const svgText = await response.text();

    const container = document.createElement("div");
    container.innerHTML = svgText;
    container.style.position = "absolute";
    container.style.visibility = "hidden";
    container.style.pointerEvents = "none";
    container.style.left = "-99999px";
    container.style.top = "-99999px";
    document.body.appendChild(container);

    const svg = container.querySelector("svg");
    if (!svg) {
      document.body.removeChild(container);
      throw new Error("No <svg> element found in SVG text");
    }

    // Collect all existing <path> elements
    const paths = Array.from(svg.querySelectorAll("path"));

    // Convert other shape elements to paths
    const circles = Array.from(svg.querySelectorAll("circle"));
    for (const circle of circles) {
      paths.push(circleToPath(circle, svg));
    }

    const ellipses = Array.from(svg.querySelectorAll("ellipse"));
    for (const ellipse of ellipses) {
      paths.push(ellipseToPath(ellipse, svg));
    }

    const rects = Array.from(svg.querySelectorAll("rect"));
    for (const rect of rects) {
      paths.push(rectToPath(rect, svg));
    }

    const lines = Array.from(svg.querySelectorAll("line"));
    for (const line of lines) {
      paths.push(lineToPath(line, svg));
    }

    const polygons = Array.from(svg.querySelectorAll("polygon"));
    for (const polygon of polygons) {
      paths.push(polygonToPath(polygon, svg));
    }

    const polylines = Array.from(svg.querySelectorAll("polyline"));
    for (const polyline of polylines) {
      paths.push(polylineToPath(polyline, svg));
    }

    let viewBox: ViewBox;
    if (svg.viewBox && svg.viewBox.baseVal) {
      const vb = svg.viewBox.baseVal;
      viewBox = { x: vb.x, y: vb.y, w: vb.width, h: vb.height };
    } else {
      const width = parseFloat(svg.getAttribute("width") || "100");
      const height = parseFloat(svg.getAttribute("height") || "100");
      viewBox = { x: 0, y: 0, w: width, h: height };
    }

    return { svg, paths, viewBox, container };
  })();

  parsedSvgCache.set(svgUrl, promise);
  parsedSvgEvictionQueue.push(svgUrl);

  if (parsedSvgEvictionQueue.length > MAX_PARSED_SVGS) {
    const evictUrl = parsedSvgEvictionQueue.shift();
    if (evictUrl) {
      parsedSvgCache
        .get(evictUrl)
        ?.then((entry) => {
          if (entry.container.parentNode) {
            entry.container.parentNode.removeChild(entry.container);
          }
        })
        .catch(() => undefined);
      parsedSvgCache.delete(evictUrl);
      for (const key of fittedPointsCache.keys()) {
        if (key.startsWith(`${evictUrl}|`)) {
          fittedPointsCache.delete(key);
        }
      }
    }
  }

  return promise;
}

export type CachedSvgPointsParams = {
  svgUrl: string;
  count: number;
  fitWidth: number;
  fitHeight: number;
  paddingPx: number;
  offsetX: number;
  offsetY: number;
  outlineRatio?: number;
};

export async function getCachedFittedSvgPoints(
  params: CachedSvgPointsParams
): Promise<Point[]> {
  const outlineRatio = params.outlineRatio ?? 0.85;
  const key = [
    params.svgUrl,
    `count:${params.count}`,
    `fit:${params.fitWidth}x${params.fitHeight}`,
    `pad:${params.paddingPx}`,
    `off:${Math.round(params.offsetX)}x${Math.round(params.offsetY)}`,
    `outline:${outlineRatio}`,
  ].join("|");

  const cached = fittedPointsCache.get(key);
  if (cached) return cached;

  const promise = (async () => {
    const { svg, paths, viewBox } = await getParsedSvgForUrl(params.svgUrl);
    if (paths.length === 0) throw new Error("No paths found in SVG");

    const rng = makeMulberry32(hashStringToSeed(key));

    const outlineCount = Math.floor(params.count * outlineRatio);
    const interiorCount = params.count - outlineCount;

    const outlinePoints = samplePointsFromPaths(paths, outlineCount, rng);
    if (outlinePoints.length === 0) {
      throw new Error("Failed to sample outline points");
    }

    let interiorPoints: Point[] = [];
    try {
      interiorPoints = await samplePointsInFillFromPaths(
        paths,
        viewBox,
        interiorCount,
        svg,
        rng
      );
      if (interiorPoints.length < interiorCount) {
        const additionalOutline = samplePointsFromPaths(
          paths,
          interiorCount - interiorPoints.length,
          rng
        );
        interiorPoints = interiorPoints.concat(additionalOutline);
      }
    } catch {
      interiorPoints = samplePointsFromPaths(paths, interiorCount, rng);
    }

    const sampledPoints = outlinePoints.concat(interiorPoints);
    const fittedPoints = fitPointsToRect(
      sampledPoints,
      viewBox,
      params.fitWidth,
      params.fitHeight,
      params.paddingPx
    );

    return fittedPoints.map((p) => ({
      x: p.x + params.offsetX,
      y: p.y + params.offsetY,
    }));
  })();

  fittedPointsCache.set(key, promise);
  return promise;
}
