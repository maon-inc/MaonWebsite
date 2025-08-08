import Link from 'next/link';

export default function Links() {
  return (
    <div className="w-full flex items-center justify-center py-32 bg-[#DFD3C2]">
      <div className="flex items-center gap-8">
        {/* Waitlist Link */}
        <Link href="/demo" className="group relative inline-flex overflow-hidden">
          <div className="relative flex items-center gap-2 px-3 py-1">
            <span className="relative z-10 font-geist-sans text-[#313233] text-lg tracking-tight transition-colors duration-300 group-hover:text-[#fcf8f4]">
              Sign up for the waitlist
            </span>
            <span className="relative z-10 w-3.5 h-3.5 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-300"
              >
                <path
                  d="M1 7H13M13 7L7 1M13 7L7 13"
                  stroke="#313233"
                  strokeWidth="1.5"
                  className="transition-colors duration-300 group-hover:stroke-[#fcf8f4]"
                />
              </svg>
            </span>
          </div>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#313233] transition-all duration-300 group-hover:h-full"></span>
        </Link>

        {/* Research Link */}
        <Link href="/science" className="group relative inline-flex overflow-hidden">
          <div className="relative flex items-center gap-2 px-3 py-1">
            <span className="relative z-10 font-geist-sans text-[#313233] text-lg tracking-tight transition-colors duration-300 group-hover:text-[#fcf8f4]">
              Look at the Research
            </span>
            <span className="relative z-10 w-3.5 h-3.5 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-300"
              >
                <path
                  d="M1 7H13M13 7L7 1M13 7L7 13"
                  stroke="#313233"
                  strokeWidth="1.5"
                  className="transition-colors duration-300 group-hover:stroke-[#fcf8f4]"
                />
              </svg>
            </span>
          </div>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#313233] transition-all duration-300 group-hover:h-full"></span>
        </Link>
      </div>
    </div>
  );
}