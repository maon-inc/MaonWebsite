// src/components/ServiceIntro.tsx

export default function ServiceIntro() {
    return (
      <section className="bg-brand-light py-24 overflow-hidden">
        {/* Full-width container with 1% padding on each side */}
        <div className="w-full px-[4%]">
          {/* 
            – Single column by default 
            – Two columns at ≥lg 
            – Only the gap between them is responsive 
          */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 items-start"
            style={{
              columnGap: 'clamp(2rem, 5vw, 6rem)', // min 2rem, scales with 5vw, max 6rem
            }}
          >
            {/* LEFT LABEL */}
            <h2
              className="font-serif text-current leading-tight whitespace-nowrap"
              style={{
                fontSize: '1rem', // fixed
              }}
            >
              The service that we provide
            </h2>
  
            {/* RIGHT CONTENT */}
            <div className="flex flex-col gap-8">
              <p
                className="leading-tight"
                style={{
                  fontSize: 'clamp(1.25rem, 1rem + 0.8vw, 2.3rem)', // fluid headline
                  maxWidth: '65ch',                             // avoid overly long lines
                }}
              >
                At Moan, we offer a wellness app that not only delivers you
                AI-driven metrics, but a way to passively influence your
                emotions and talk with your own body.
              </p>
              <a
                href="#learn-more"
                className="inline-flex items-center gap-2 self-start border-b border-current pb-[2px] uppercase hover:opacity-80 transition-opacity"
                style={{
                  fontSize: 'clamp(0.9rem, 0.8rem + 0.3vw, 1.1rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                Learn more
                <svg width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }
  