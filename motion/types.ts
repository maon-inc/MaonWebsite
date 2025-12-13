/**
 * Motion engine types
 * Minimal shared types for rAF-based motion system
 */

export interface MotionState {
  scrollY: number;
  viewportH: number;
  viewportW: number;
  time: number; // milliseconds
  velocity?: number;
}

export type Subscriber = (state: MotionState) => void;

export interface Range {
  start: number;
  end: number;
}

