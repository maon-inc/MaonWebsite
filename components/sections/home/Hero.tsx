import HeroDots from "./HeroDots";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative w-full aspect-square lg:aspect-[4/3]">
            <HeroDots
              svgUrl="/assets/hero_svg.svg"
              count={1200}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


