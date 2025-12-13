import HeroDots from "./HeroDots";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side: Headline + CTA */}
          <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
            <h1 className="text-d-merriweather-48-bold md:text-d-merriweather-45-regular">
              Your headline here
            </h1>
            <p className="text-d-lato-24-semibold text-foreground/80 max-w-lg">
              A compelling description that explains your value proposition and
              invites visitors to take action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-foreground text-background rounded-md font-semibold hover:opacity-90 transition-opacity">
                Get Started
              </button>
              <button className="px-6 py-3 border border-foreground/20 rounded-md font-semibold hover:border-foreground/40 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Right side: HeroDots canvas */}
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

