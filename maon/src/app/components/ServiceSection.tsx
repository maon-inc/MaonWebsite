export default function ServiceSection() {
  return (
    <section className="px-24 mt-40">
      <p className="libre-bodoni-regular text-xl text-[#313233] text-center mb-6 tracking-tight">
        The service that we provide
      </p>
      <div className="max-w-4xl mx-auto">
        <h3 className="font-geist-sans font-semibold text-4xl leading-[55px] text-[#313233] mb-8 tracking-tight">
          At Moan, we offer a wellness app that not only delivers you AI driven metrics, but a way to passively influence your emotions and talk with out own body.
        </h3>
        <button className="flex items-center gap-2 hover:opacity-70 transition-opacity ml-1">
          <span className="font-geist-sans text-xl text-[#313233] border-b border-[#313233] pb-1 tracking-tight">
            Learn more
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="#313233" strokeWidth="1.5"/>
          </svg>
        </button>
      </div>
    </section>
  );
}