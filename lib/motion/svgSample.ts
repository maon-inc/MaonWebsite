/**
 * SVG sampling utilities
 * Parse SVG text and sample points from paths
 */

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

  document.body.removeChild(container);

  return { svg, paths, viewBox };
}

export function samplePointsFromPaths(
  paths: SVGPathElement[],
  count: number
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

    for (let j = 0; j < pathCount; j++) {
      const t = pathCount > 1 ? j / (pathCount - 1) : 0;
      const length = t * pathLength;
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

