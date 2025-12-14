import HeroDots from "./HeroDots";
import Nav from "@/components/site/Nav";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Dots animation - fullscreen canvas with centered SVG target */}
      <div className="absolute inset-0 w-full h-full z-0">
        <HeroDots
          svgUrl="/assets/hero_svg.svg"
          count={1200}
          targetWidth={500}
          targetHeight={500}
          targetAnchor="center"
          className="w-full h-full"
        />
      </div>

      {/* Left text block - absolute bottom-left */}
      <div className="absolute bottom-12 left-12 max-w-[650px] z-20">
        <h1 className="text-d-merriweather-48-bold mb-4 text-[#171717]">
          Making a balanced life with intentional decisions.
        </h1>
        <p className="text-d-merriweather-24-regular text-[#171717]">
          Your nervous system&apos;s co-pilot.
        </p>
      </div>

      {/* Right nav - fixed, bottom-aligned with text block */}
      <div className="fixed right-12 bottom-12 z-20">
        <Nav />
      </div>
    </section>
  );
}