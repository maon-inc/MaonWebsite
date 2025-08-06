export default function Footer() {
  return (
    <footer className="bg-[#313233] text-white px-16 pt-10 pb-24">
      <div className="flex justify-between mb-12">
        {/* Column 1 */}
        <div className="flex flex-col max-w-xs">
          <h3 className="font-geist-sans font-bold text-3xl mb-8 tracking-tight">
            MAON
          </h3>
          <p className="font-geist-sans text-xl text-[#fcf8f4] mb-8 tracking-tight">
            Healing comes from your hand.
          </p>
          <button className="flex items-center gap-2 hover:opacity-70 transition-opacity self-start">
            <span className="font-geist-sans text-xl text-[#fcf8f4] border-b border-[#fcf8f4] pb-1 tracking-tight">
              Sign up for waitlist
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="#fcf8f4" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
        
        {/* Right Side Links */}
        <div className="flex gap-32">
          {/* Column 2 - Navigate */}
          <div>
            <h4 className="font-geist-sans text-xl text-[rgba(252,248,244,0.58)] mb-8 tracking-tight">
              NAVIGATE
            </h4>
            <ul className="space-y-4">
              <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Homepage</button></li>
              <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Mission</button></li>
              <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Product</button></li>
              <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Research</button></li>
              <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Contact Us</button></li>
            </ul>
          </div>
          
          {/* Column 3 - Company */}
          <div>
            <h4 className="font-geist-sans text-xl text-[rgba(252,248,244,0.58)] mb-8 tracking-tight">
              COMPANY
            </h4>
            <ul className="space-y-4">
              <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Terms of Service</button></li>
              <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Privacy Policy</button></li>
            </ul>
          </div>
          
          {/* Column 4 - Contact */}
          <div>
            <h4 className="font-geist-sans text-xl text-[rgba(252,248,244,0.58)] mb-8 tracking-tight">
              CONTACT US
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:Moan@gmail.com" 
                   className="font-geist-sans text-xl text-[#fcf8f4] underline hover:opacity-70 transition-opacity tracking-tight">
                  maonhealth@gmail.com
                </a>
              </li>
              <li>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Logo */}
      <div className="ml-[-12px]">
        <div className="font-geist-sans font-bold text-[200px] text-[#fcf8f4] leading-6 tracking-tight">
          MAON.
        </div>
      </div>
    </footer>
  );
}