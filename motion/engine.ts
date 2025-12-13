/**
 * Motion engine
 * Minimal rAF-based loop for tracking scroll and viewport state
 */

import type { MotionState, Subscriber } from "./types";

let state: MotionState = {
  scrollY: 0,
  viewportH: 0,
  viewportW: 0,
  time: 0,
};

const subscribers = new Set<Subscriber>();
let rafId: number | null = null;
let startTime: number | null = null;

function updateState() {
  state.scrollY = window.scrollY;
  state.viewportH = window.innerHeight;
  state.viewportW = window.innerWidth;
  state.time = startTime ? performance.now() - startTime : 0;
}

function tick() {
  updateState();
  subscribers.forEach((subscriber) => subscriber(state));
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (rafId !== null) return;
  startTime = performance.now();
  updateState();
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (rafId === null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
  startTime = null;
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

