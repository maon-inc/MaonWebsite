/******************************************************************************
 *  HeroSection.tsx  –  fluid headline (6 rem → 12 rem) + darker tint 20 %
 ******************************************************************************/

export default function HeroSection() {
    return (
      <section
        className="relative mx-auto mb-12 w-[98vw] h-[85vh] overflow-hidden
                   rounded-2xl bg-gradient-to-br from-[#9fb2be] to-[#c4cfd6]"
      >
        {/* ─── phone mock-up ─────────────────────────────────────── */}
        <img
          src="/img/phone-hero.png"
          alt="Moan app on phone"
          className="pointer-events-none absolute right-[5%] bottom-0 z-10
                     w-auto max-h-[82%] translate-y-[9%] object-contain drop-shadow-2xl"
        />
  
        {/* ─── 20 % tint overlay (sits above phone, below text) ─── */}
        <div className="pointer-events-none absolute inset-0 z-15 bg-black/20 mix-blend-multiply" />
  
        {/* ─── foreground content grid (z-20) ───────────────────── */}
        <div className="relative z-20 grid h-full lg:grid-cols-2">
          <div className="flex flex-col justify-between px-10 lg:px-24 py-10 text-white">
            {/* icon + tagline */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/70">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 4v16M4 12h16" strokeWidth="2" />
                </svg>
              </div>
              <p className="max-w-[230px] text-[15.6px] leading-[1.45] tracking-[.04em]">
                A new era of wellness that is personalized to you, forever
                changing your emotional state.
              </p>
            </div>
  
            {/* fluid headline + CTA */}
            <div className="space-y-10 pb-2">
              <h1
                className="leading-[0.83] whitespace-normal font-serif"
                style={{
                  /* 6 rem at 768 px → 12 rem at very large screens */
                  fontSize: 'clamp(6rem, 5rem + 4vw, 12rem)',
                }}
              >
                <span
                  className="font-[MonteCarlo] italic tracking-wider"
                  /* “Passive” 12 % larger than Wellness */
                  style={{ fontSize: '1.12em' }}
                >
                  Passive&nbsp;
                </span>
                <span>Wellness.</span>
              </h1>
  
              <a
                href="#product"
                className="inline-flex items-center gap-2 border-b border-white/70 pb-[3px]
                            text-[17px] tracking-[.02em] hover:border-white"
                style={{ letterSpacing: '-0.02em' }}
              >
                Explore our product
                <svg width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="2" />
                </svg>
              </a>
            </div>
          </div>
  
          {/* empty right column (phone already positioned) */}
          <div />
        </div>
      </section>
    );
  }
  