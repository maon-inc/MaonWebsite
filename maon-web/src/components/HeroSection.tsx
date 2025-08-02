export default function HeroSection() {
    return (
      <section className="max-w-7xl mx-auto my-10 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#9db3bd] to-[#c2cfd6]">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT ─────────────── */}
          <div className="p-8 lg:p-14 flex flex-col justify-center text-white">
            <span className="uppercase tracking-wide text-sm opacity-80 flex items-center gap-2">
              <svg width="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2" />
              </svg>
              A new era of wellness
            </span>
  
            <h1 className="font-serif text-6xl lg:text-8xl mt-6 leading-[0.9]">
              Passive&nbsp;Wellness.
            </h1>
  
            <a
              href="#product"
              className="mt-10 inline-flex items-center gap-2 border-b pb-1 border-white/70 hover:border-white"
            >
              Explore our product
              <svg width="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="2" />
              </svg>
            </a>
          </div>
  
          {/* RIGHT ────────────── */}
          <div className="relative flex items-end justify-center pt-20 lg:pt-0">
            <img
              src="/img/phone-hero.png"
              alt="Moan app on phone"
              className="max-w-[260px] lg:max-w-[340px] drop-shadow-2xl"
            />
          </div>
        </div>
      </section>
    );
  }
  