/**
 * Example Usage of DotsCanvas and DotsScene
 *
 * This shows how to create a page where dots morph between
 * different SVG shapes as the user scrolls through sections.
 */

import DotsCanvas from "@/components/motion/DotsCanvas";
import DotsScene from "@/components/motion/DotsScene";

export default function ExamplePage() {
  return (
    // DotsCanvas wraps the entire scrollable area
    // It creates a fixed, fullscreen canvas for the dots
    <DotsCanvas
      count={1200}
      dotRadius={1.8}
      targetWidth={500}
      targetHeight={500}
      targetAnchor="center"
      initialDurationMs={1500}    // 5 seconds for initial convergence
      transitionDurationMs={500} // 1.5 seconds to transition to breathing
      morphSpeed={0.7}           // How quickly dots follow scroll (0-1)
      colorGray="#A1A1AA"         // Color when dots are moving
      colorAccent="#00A452"       // Color when dots are settled (green)
    >
      {/* Each DotsScene defines a scroll region and its target SVG */}

      {/* Scene 1: Hero section */}
      <DotsScene
        svgUrl="/assets/hero_svg.svg"
        className="relative min-h-screen"
        scrollStartOffset={-200}
      />

      {/* Scene 2: Logo section */}
      <DotsScene
        svgUrl="/assets/hero_svg2.svg"
        className="relative min-h-screen"
      />

      {/* Scene 3: Product section */}
      <DotsScene
        svgUrl="/assets/logo.svg"
        className="relative min-h-screen"
      />
    </DotsCanvas>
  );
}

/**
 * NOTES:
 *
 * 1. DotsCanvas Props:
 *    - count: Number of dots (default 1200)
 *    - dotRadius: Size of each dot (default 1.8)
 *    - targetWidth/targetHeight: Size of the SVG target area
 *    - targetAnchor: Position of SVG ("center", "center-right", etc.)
 *    - initialDurationMs: How long the initial convergence takes (default 5000)
 *    - transitionDurationMs: How long the transition to breathing takes (default 1500)
 *    - morphSpeed: How quickly dots follow scroll changes (0.01-0.2 recommended, default 0.12)
 *    - colorGray: Color when dots are far from home (default "#A1A1AA")
 *    - colorAccent: Color when dots are settled (default "#00A452")
 *
 * 2. DotsScene Props:
 *    - svgUrl: Path to the SVG file
 *    - scrollStartOffset: When to start morphing (relative to section top)
 *    - scrollEndOffset: When to finish morphing (relative to section top)
 *    - className: Styles for the section wrapper
 *    - as: HTML element type ("section", "div", "article")
 *
 * 3. How Scroll Ranges Work:
 *    - Each DotsScene measures its position in the document
 *    - scrollStart = elementTop + scrollStartOffset
 *    - scrollEnd = elementTop + scrollEndOffset (or elementTop + height)
 *    - As scroll position moves through this range, dots morph to that SVG
 *
 * 4. Transitions Between Scenes:
 *    - When scroll is between two scenes, dots interpolate between them
 *    - This creates smooth morphing as you scroll between sections
 *
 * 5. Performance Tips:
 *    - All SVGs are loaded and sampled on mount, not during scroll
 *    - Keep SVG paths simple for faster sampling
 *    - 1000-1500 dots is a good balance of visual density and performance
 *    - morphSpeed controls responsiveness vs smoothness tradeoff
 */