/**
 * Motion engine
 * Minimal rAF-based loop for tracking scroll and viewport state
 */

import type { MotionState, Subscriber } from "./types";
import { computeVelocity } from "./scroll";

let state: MotionState = {
  scrollY: 0,
  viewportH: 0,
  viewportW: 0,
  time: 0,
};

const subscribers = new Set<Subscriber>();
let rafId: number | null = null;
let startTime: number | null = null;
let accumulatedTime = 0;
let previousScrollY = 0;
let previousTime = 0;

function updateState() {
  const now = performance.now();
  state.scrollY = window.scrollY;
  state.viewportH = window.innerHeight;
  state.viewportW = window.innerWidth;
  
  if (startTime !== null) {
    const currentTime = accumulatedTime + (now - startTime);
    const deltaTime = currentTime - previousTime;
    state.time = currentTime;
    state.velocity = computeVelocity(state.scrollY, previousScrollY, deltaTime);
    previousScrollY = state.scrollY;
    previousTime = currentTime;
  } else {
    state.time = accumulatedTime;
    state.velocity = undefined;
  }
}

function tick() {
  updateState();
  subscribers.forEach((subscriber) => subscriber(state));
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (rafId !== null) return;
  startTime = performance.now();
  previousScrollY = window.scrollY;
  previousTime = accumulatedTime;
  updateState();
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (rafId === null) return;
  cancelAnimationFrame(rafId);
  if (startTime !== null) {
    accumulatedTime += performance.now() - startTime;
  }
  rafId = null;
  startTime = null;
  state.velocity = undefined;
}

export function subscribe(subscriber: Subscriber): () => void {
  subscribers.add(subscriber);
  if (subscribers.size === 1) {
    start();
  }
  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) {
      stop();
    }
  };
}

export { start, stop };

