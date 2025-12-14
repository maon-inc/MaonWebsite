import HeroDots from "./HeroDots";
import Nav from "@/components/site/Nav";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Dots animation - centered-right in the hero, avoiding left text */}
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none md:pr-[200px] lg:pr-[400px] z-0">
        <div className="w-full max-w-2xl h-full max-h-[80vh]">
          <HeroDots
            svgUrl="/assets/hero_svg.svg"
            count={1200}
            className="w-full h-full"
          />
        </div>
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
