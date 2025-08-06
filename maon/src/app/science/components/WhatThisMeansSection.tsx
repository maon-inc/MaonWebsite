export default function WhatThisMeansSection() {
  return (
    <section className="bg-[#f5f0ea] px-20 py-24 -mt-16 relative z-10">
      <div className="max-w-5xl mx-auto">
        <p className="libre-bodoni-regular text-[30px] text-[#313233] mb-12 tracking-[-0.2333px] text-center">
          What this means
        </p>

        <div className="space-y-24">
          {/* Evidence-Based */}
          <div className="flex items-start gap-8">
            <div className="w-14 h-14 flex-shrink-0">
              <svg width="81" height="80" viewBox="0 0 81 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M70.3006 26.5156V69.602H10.6426V26.5156" stroke="#313233" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M76.929 9.94141H4.01367V26.5131H76.929V9.94141Z" stroke="#313233" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M33.8418 39.7734H47.0991" stroke="#313233" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 max-w-xl">
              <h3 className="font-geist-sans font-semibold text-[36px] text-[#000] mb-4 tracking-tight">
                Evidence-Based
              </h3>
              <p className="font-geist-sans text-[24px] leading-[35px] text-[#000] tracking-tight">
                Tested with 41 participants at Cornell and MIT, our
                vibration patterns help you stay alert, feel calmer, and
                build stronger connections.
              </p>
            </div>
          </div>

          {/* Works With What You Have */}
          <div className="flex items-start gap-8 justify-end">
            <div className="flex-1 max-w-xl text-right">
              <h3 className="font-geist-sans font-semibold text-[36px] text-[#000] mb-4 tracking-tight">
                Works With What You Have:
              </h3>
              <p className="font-geist-sans text-[24px] leading-[35px] text-[#000] tracking-tight">
                Maon runs quietly on your Apple Watch or our upcoming smart
                ring. No extra gear needed to get started, with deeper
                customization if you want it.
              </p>
            </div>
            <div className="w-20 h-20 flex-shrink-0">
              <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M39.8292 62.971C52.6424 62.971 63.0296 52.5838 63.0296 39.7707C63.0296 26.9575 52.6424 16.5703 39.8292 16.5703C27.0161 16.5703 16.6289 26.9575 16.6289 39.7707C16.6289 52.5838 27.0161 62.971 39.8292 62.971Z" stroke="#313233" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M39.8281 29.8281V39.7711L44.7996 44.7426" stroke="#313233" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M54.778 57.5058L53.618 70.1997C53.4687 71.8524 52.7049 73.3889 51.4776 74.5058C50.2503 75.6226 48.6487 76.2385 46.9894 76.2318H32.6383C30.9789 76.2385 29.3773 75.6226 28.15 74.5058C26.9227 73.3889 26.159 71.8524 26.0096 70.1997L24.8496 57.5058M24.8828 22.0424L26.0428 9.34855C26.1916 7.70158 26.9507 6.16972 28.171 5.05368C29.3912 3.93764 30.9846 3.31802 32.6383 3.31646H47.0556C48.715 3.30973 50.3166 3.92563 51.5439 5.04248C52.7712 6.15932 53.535 7.69588 53.6843 9.34855L54.8443 22.0424" stroke="#313233" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Everything Connected */}
          <div className="flex items-start gap-8">
            <div className="w-18 h-18 flex-shrink-0">
              <svg
                viewBox="14 14 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M40 20V60M40 20L20 40L40 60L60 40L40 20Z"
                  stroke="#313233"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="40" cy="20" r="4" fill="#313233" />
                <circle cx="40" cy="60" r="4" fill="#313233" />
                <circle cx="20" cy="40" r="4" fill="#313233" />
                <circle cx="60" cy="40" r="4" fill="#313233" />
              </svg>
            </div>
            <div className="flex-1 max-w-xl">
              <h3 className="font-geist-sans font-semibold text-[36px] text-[#000] mb-4 tracking-tight">
                Everything Connected:
              </h3>
              <p className="font-geist-sans text-[24px] leading-[35px] text-[#000] tracking-tight">
                Our AI learns your patterns and responds naturally.
                Hardware, software, and AI work together to understand your
                body and help when you need it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 