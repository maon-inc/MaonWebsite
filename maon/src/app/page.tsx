import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ebe6df]">
      <nav className="flex items-center justify-between px-8 py-6 md:px-16">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="MAON Logo"
            width={40}
            height={40}
            priority
          />
        </div>
        <div className="flex items-center gap-8">
          <button className="text-black hover:opacity-70 transition-opacity">Mission</button>
          <button className="text-black hover:opacity-70 transition-opacity">Products</button>
          <button className="text-black hover:opacity-70 transition-opacity">Research</button>
          <button className="text-black hover:opacity-70 transition-opacity">Demo</button>
        </div>
      </nav>

      <main className="flex flex-col">
        <section className="bg-[#ebe6df] px-8 md:px-12 lg:px-[49px] py-8 md:py-12 lg:py-[132px]">
          <div className="relative bg-black/[0.08] rounded-[40px] overflow-hidden max-w-[1414px] mx-auto">
            <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[821px]">
              <div className="flex-1 p-8 md:p-12 lg:p-[111px] flex flex-col justify-between">
                <div>
                  <h1 className="font-bold text-[24px] md:text-[30px] lg:text-[35px] leading-[1.7] text-[#313233] mb-0">
                    Haptic AI Wearable for
                  </h1>
                  <h2 className="libre-bodoni-bold-italic text-[32px] md:text-[40px] lg:text-[45px] leading-[1.33] text-[#313233]">
                    Emotion Regulation
                  </h2>
                </div>
                
                <div className="mt-12 lg:mt-auto mb-8 lg:mb-[76px]">
                  <div className="flex items-baseline gap-2 lg:gap-4">
                    <span className="libre-bodoni-regular-italic text-[60px] md:text-[100px] lg:text-[152px] text-[#313233] leading-[0.8] tracking-[-0.22px]">
                      Passive
                    </span>
                    <span className="libre-bodoni-regular text-[60px] md:text-[100px] lg:text-[152px] text-[#fcf8f4] leading-[0.8] tracking-[-0.22px]">
                      Wellness.
                    </span>
                  </div>
                  
                  <button className="mt-6 lg:mt-[50px] text-[16px] lg:text-[19px] text-[#313233] relative group">
                    <span className="border-b border-[#313233] pb-[2px]">Explore our product</span>
                    <span className="ml-2 inline-block w-[14px] h-[14px] relative">
                      <span className="absolute inset-0 flex items-center justify-center">→</span>
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="relative w-full lg:w-[840px] h-[400px] lg:h-[821px] flex-shrink-0">
                <Image
                  src="/placeholder_main.png"
                  alt="Hand holding MAON App"
                  fill
                  className="object-cover rounded-[40px]"
                  style={{
                    objectPosition: '9.48% 98.02%',
                    transform: 'scale(1.43)'
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 md:px-16 py-16">
          <div className="max-w-4xl">
            <p className="text-base lato-regular mb-6 opacity-70">The service that we provide</p>
            <h3 className="text-2xl md:text-3xl lato-regular leading-relaxed mb-8">
              At Moan, we offer a wellness app that not only delivers you AI driven metrics, but a way to passively influence your emotions and talk with out own body.
            </h3>
            <button className="flex items-center gap-2 text-base hover:opacity-70 transition-opacity">
              <span className="border-b border-black pb-1">Learn more</span>
              <span>→</span>
            </button>
          </div>
        </section>

        <section className="px-8 md:px-16 pb-16">
          <h3 className="text-lg mb-8 lato-regular">What makes us unique</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F5F1EC] rounded-[20px] p-8 min-h-[200px] flex flex-col justify-end">
              <h4 className="text-lg lato-regular">Passive influence<br/>on your emotion</h4>
            </div>
            <div className="bg-[#F5F1EC] rounded-[20px] p-8 min-h-[200px] flex flex-col justify-end">
              <h4 className="text-lg lato-regular">Talk with your body</h4>
            </div>
            <div className="bg-[#F5F1EC] rounded-[20px] p-8 min-h-[200px] flex flex-col justify-end">
              <h4 className="text-lg lato-regular">Personalized<br/>experience that gets<br/>better.</h4>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#2C2C2C] text-white px-8 md:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">MAON</h3>
            <p className="text-sm mb-4 opacity-80">
              Get a passive influence on your emotional state and talk with your own body.
            </p>
            <button className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity">
              <span>Download</span>
              <span>→</span>
            </button>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-60">NAVIGATE</h4>
            <ul className="space-y-2">
              <li><button className="text-sm hover:opacity-70 transition-opacity">Homepage</button></li>
              <li><button className="text-sm hover:opacity-70 transition-opacity">Mission</button></li>
              <li><button className="text-sm hover:opacity-70 transition-opacity">Product</button></li>
              <li><button className="text-sm hover:opacity-70 transition-opacity">Research</button></li>
              <li><button className="text-sm hover:opacity-70 transition-opacity">Contact Us</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-60">COMPANY</h4>
            <ul className="space-y-2">
              <li><button className="text-sm hover:opacity-70 transition-opacity">Terms of Service</button></li>
              <li><button className="text-sm hover:opacity-70 transition-opacity">Privacy Policy</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-60">CONTACT US</h4>
            <ul className="space-y-2">
              <li><a href="mailto:Moan@gmail.com" className="text-sm hover:opacity-70 transition-opacity">Moan@gmail.com</a></li>
              <li><span className="text-sm">123 - 124 - 1234</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="text-6xl md:text-8xl font-bold tracking-wider opacity-20">
            MAON.
          </div>
        </div>
      </footer>
    </div>
  );
}