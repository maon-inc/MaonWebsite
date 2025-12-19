# Maon Website

Official website for Maon Intelligence - an AI-powered ring for nervous system balance.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **Styling**: Tailwind CSS 4
- **Database**: Convex (real-time backend)
- **Fonts**: Lato (sans-serif), Merriweather (serif) via `next/font`

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (start both Next.js and Convex)
npm run dev          # Terminal 1: Next.js
npx convex dev       # Terminal 2: Convex (syncs functions to dev deployment)

# Build for production
npm run build

# Deploy Convex to production
npx convex deploy
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (site)/            # Site route group
│   │   ├── page.tsx       # Homepage
│   │   ├── how-it-works/  # How it works page
│   │   ├── our-story/     # Our story page
│   │   ├── privacy/       # Privacy policy
│   │   ├── tos/           # Terms of service
│   │   └── waitlist/      # Waitlist signup page
│   ├── globals.css        # Global styles & CSS variables
│   └── layout.tsx         # Root layout (fonts, metadata, Convex provider)
│
├── components/
│   ├── ConvexClientProvider.tsx  # Convex React provider
│   ├── motion/            # Dot animation system
│   │   ├── DotsCanvas.tsx # Main canvas with physics simulation
│   │   ├── DotsScene.tsx  # Scroll-triggered scene wrapper
│   │   └── dotsTargets.ts # Target generation utilities
│   ├── sections/          # Page section components
│   │   ├── home/          # Homepage sections (Hero, Problem, Day, etc.)
│   │   ├── how-it-works/  # How it works sections
│   │   ├── our-story/     # Our story page content
│   │   ├── privacy/       # Privacy policy content
│   │   ├── tos/           # Terms of service content
│   │   └── Waitlist/      # Waitlist form components
│   └── site/              # Site-wide components (Nav, Footer)
│
├── convex/                # Convex backend
│   ├── _generated/        # Auto-generated Convex types
│   ├── schema.ts          # Database schema (waitlist table)
│   └── waitlist.ts        # Waitlist mutations & queries
│
├── hooks/                 # Custom React hooks
│   ├── useIsDesktop.ts    # Desktop breakpoint detection
│   └── useMediaQuery.ts   # Generic media query hook
│
├── lib/                   # Utility libraries
│   └── motion/            # Motion utilities (random, SVG sampling)
│
├── motion/                # Core motion engine (framework-agnostic)
│   ├── engine.ts          # rAF loop, scroll/viewport state
│   ├── math.ts            # Math utilities (clamp, lerp, mapRange)
│   ├── measures.ts        # DOM measurement utilities
│   ├── observe.ts         # ResizeObserver/IntersectionObserver wrappers
│   ├── scroll.ts          # Scroll reading & velocity computation
│   └── types.ts           # TypeScript types
│
├── public/assets/         # Static assets (SVGs, images)
│
└── styles/
    └── typography.css     # Typography utility classes
```

## Motion System

The website features a custom particle animation system with scroll-driven animations.

### Core Engine (`/motion`)

A minimal, performant rAF-based loop for scroll animations:

- **`engine.ts`** - Central animation loop tracking scroll position, viewport dimensions, time, and velocity. Subscribers receive continuous updates via `subscribe()`.
- **`math.ts`** - Pure math utilities: `clamp`, `clamp01`, `lerp`, `mapRange`
- **`measures.ts`** - DOM measurement utilities for converting element geometry into scroll ranges
- **`observe.ts`** - ResizeObserver/IntersectionObserver wrappers for invalidating measurements
- **`scroll.ts`** - Scroll reading utilities and velocity computation
- **`types.ts`** - TypeScript types for `MotionState`, `Subscriber`, and `Range`

The engine maintains a single `MotionState` object and automatically starts/stops based on subscriber count.

### React Components (`/components/motion`)

- **`DotsCanvas.tsx`** - Main canvas component that renders ~1000 animated dots. Manages physics simulation, scene registration, and scroll-based morphing between SVG shapes.
- **`DotsScene.tsx`** - Wrapper component for defining scroll-triggered animation scenes. Supports modes: `svg` (morph to shape), `scatter`, and `dissipate`.
- **`dotsTargets.ts`** - Utilities for generating scatter and dissipate target positions.

### How Dot Animations Work

1. `DotsCanvas` creates a fixed canvas overlay with N dots at random positions
2. `DotsScene` components register themselves with scroll ranges and target providers
3. As user scrolls, dots morph between SVG shapes using spring physics
4. Colors transition from gray (moving) to accent (settled) based on distance from target
5. Different modes apply different physics: `svg` for shape morphing, `scatter` for chaos, `dissipate` for explosion effects

## Typography System

Typography classes are defined in `styles/typography.css` with the naming convention:

```
text-{viewport}-{font}-{size}-{weight}
```

- **viewport**: `d` (desktop) or `m` (mobile)
- **font**: `merriweather` (serif) or `lato` (sans)
- **size**: pixel size (e.g., `48`, `24`, `16`)
- **weight**: `regular`, `bold`, or `italic`

Example: `text-d-merriweather-48-bold` = Desktop Merriweather 48px Bold

See `styles/typography.css` for all available classes and their usage locations.

## Convex Backend

The project uses Convex for real-time data. Current schema:

```typescript
// convex/schema.ts
waitlist: {
  email: string,
  country: string,
  region: string,
}
```

### Convex Functions

- `waitlist.addToWaitlist` - Mutation to add email to waitlist (with duplicate check, validates email uniqueness)
- `waitlist.getWaitlistCount` - Query to get total signups (updates in real-time)

### Development Workflow

1. Run `npx convex dev` in a separate terminal while developing
2. This watches your `convex/` folder and syncs changes to your dev deployment
3. Use `npx convex deploy` to push to production

### Environment Variables

Create a `.env.local` file (auto-generated by `npx convex dev`):

```
CONVEX_DEPLOYMENT=dev:<your-deployment-name>
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

## CSS Variables

Global CSS variables are defined in `app/globals.css`:

```css
:root {
  --background: #FCFCFC;
  --foreground: #13120A;
  --text-primary: #171717;
  --text-secondary: #525252;
  --accent: #97CEE7;
  --accent-hover: #97CEE7;
  --border: #E5E5E5;
  
  /* Dot animation colors */
  --dots-color-gray: #A1A1AA;
  --dots-color-accent: #97CEE7;
}
```

## Key Patterns

### Scroll Container

The homepage uses a custom scroll container (not `window.scrollY`) for better control:

```tsx
// app/(site)/page.tsx
const setScrollEl = useCallback((node: HTMLDivElement | null) => {
  scrollContainerRef.current = node;
  setScrollContainer(node);  // Tell motion engine about custom scroll
}, []);
```

### Responsive Design

Use the `useIsDesktop()` hook for responsive logic:

```tsx
const isDesktop = useIsDesktop();  // true for md: breakpoint and up
```

### Reduced Motion

The motion system respects `prefers-reduced-motion`:
- Dots snap to positions without animation
- Physics simulation is skipped
- Static rendering at target positions

## Development Notes

- SVGs for dot animations are in `public/assets/` and sampled at runtime
- The motion engine resets on Next.js soft navigations to prevent memory leaks
- Dot count adjusts based on device: ~700 on mobile, ~1000 on desktop
- All motion state is exposed via CSS variables for Tailwind integration
- Waitlist uses Convex mutations directly (no API routes needed)
- Location data (country/region) is gathered client-side via ipapi.co
