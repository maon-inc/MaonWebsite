# Maon Website

## Motion System

This project uses a custom requestAnimationFrame-based motion engine for scroll-driven animations. The system is split into two parts:

### `/motion` - Core Engine

The motion engine (`/motion`) provides a minimal, performant foundation for scroll-based animations:

- **`engine.ts`** - Central rAF loop that tracks scroll position, viewport dimensions, time, and velocity. Subscribers receive continuous updates via `subscribe()`.
- **`math.ts`** - Pure math utilities: `clamp`, `clamp01`, `lerp`, `mapRange`.
- **`measures.ts`** - DOM measurement utilities for converting element geometry into scroll ranges.
- **`observe.ts`** - Thin wrappers around ResizeObserver and IntersectionObserver for invalidating measurements and pausing work when offscreen.
- **`scroll.ts`** - Scroll reading utilities and velocity computation.
- **`types.ts`** - Shared TypeScript types for `MotionState`, `Subscriber`, and `Range`.

The engine maintains a single `MotionState` object and automatically starts/stops the animation loop based on subscriber count. Time is continuous across start/stop cycles, and velocity is calculated for momentum-based effects.

### `/components/motion` - React Components

React components that consume the motion engine:

- **`Scene.tsx`** - Tracks scroll progress through an element's lifecycle. Exposes a `--p` CSS variable (0-1) that can be used with Tailwind arbitrary values. Supports `enter-exit` and `top-top` modes, with optional offset and frame throttling.
- **`Reveal.tsx`** - Uses IntersectionObserver to reveal elements when they enter the viewport. Applies a CSS class when revealed and can be configured for one-time or repeatable reveals.

All motion state is exposed via CSS variables, allowing React components to remain thin composition layers while Tailwind handles styling based on motion values.

