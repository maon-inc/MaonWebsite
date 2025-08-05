"use client";

import Image from "next/image";
import Lottie from "lottie-react";
import logoAnimation from "../../public/animations/logo/moving_logo.json";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ebe6df]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-16 py-6">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="MAON Logo"
            width={40}
            height={40}
            priority
          />
        </div>
        
        {/* Right Side Navigation */}
        <div className="flex items-center gap-16">
          <button className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
            Mission
          </button>
          <button className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
            Products
          </button>
          <button className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
            Research
          </button>
          <button className="font-geist-sans font-bold text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
            Demo
          </button>
        </div>
      </nav>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="bg-[#ebe6df] px-12 pb-24">
          <div className="group relative bg-black/[0.08] rounded-[40px] overflow-hidden mx-auto max-w-[1380px] h-[650px] flex">
            {/* Left Side Content */}
            <div className="flex flex-col justify-between p-20 pr-10 flex-1 z-10">
              {/* Title */}
              <div className="max-w-md">
                <h1 className="font-geist-sans font-bold text-3xl leading-[50px] text-[#313233] transition-colors duration-700 group-hover:text-[#fcf8f4]">
                  Haptic AI Wearable for{' '}
                  <span className="libre-bodoni-bold-italic text-4xl leading-[50px] text-[#313233] italic transition-colors duration-700 group-hover:text-[#fcf8f4]">
                    Emotion Regulation
                  </span>
                </h1>
              </div>
              
              {/* Bottom Content */}
              <div className="flex flex-col gap-8">
                {/* Passive Wellness Text - Horizontal Layout */}
                <div className="flex items-baseline gap-4">
                  <span className="libre-bodoni-regular-italic text-[#313233] italic text-[150px] leading-none tracking-tight transition-colors duration-700 group-hover:text-[#fcf8f4]">
                    Passive
                  </span>
                </div>
                
                {/* Explore Button */}
                <button className="flex items-center gap-2 hover:opacity-70 transition-opacity self-start">
                  <span className="font-geist-sans text-[#313233] border-b border-[#313233] pb-0.5 text-lg tracking-tight transition-all duration-700 group-hover:text-[#fcf8f4] group-hover:border-[#fcf8f4]">
                    Explore our product
                  </span>
                  <span className="w-3.5 h-3.5 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-700">
                      <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="#313233" strokeWidth="1.5" className="transition-colors duration-700 group-hover:stroke-[#fcf8f4]"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
            
            {/* Right Side - Gradient Canvas with Expanding Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#93A6AA] to-[#B2C3C4] rounded-[40px] transition-all duration-700 ease-out translate-x-[40%] group-hover:translate-x-0"></div>
            
            {/* Lottie Animation - Initially half hidden, fully shown on hover */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] transition-transform duration-700 ease-out translate-x-[50%] group-hover:translate-x-[10%] z-[5]">
              <Lottie 
                animationData={logoAnimation} 
                loop={true}
                className="w-full h-full opacity-50"
              />
            </div>
            
            {/* Right Side Content */}
            <div className="relative flex-3 rounded-[40px] overflow-hidden flex items-end p-20 pl-5 z-10">
              <span className="libre-bodoni-regular text-[#fcf8f4] text-[150px] leading-none tracking-tight mb-[60px]">
                Wellness.
              </span>
            </div>
          </div>
        </section>

        {/* Service Section */}
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

        {/* What Makes Us Unique Section */}
        <section className="bg-[#f5efe8] mt-44 py-8 px-24 min-h-[729px]">
          <h3 className="libre-bodoni-medium text-3xl leading-[55px] text-[#484848] mb-28 tracking-tight">
            What makes us unique
          </h3>
          
          <div className="flex justify-center gap-11">
            {/* Card 1 */}
            <div className="bg-[#f5efe8] border-[2.73px] border-[#5d5d5d] rounded-[36.4px] flex flex-col justify-end w-[342px] h-[399px] p-12">
              <h4 className="font-geist-sans font-medium text-2xl leading-8 text-black tracking-tight max-w-[230px]">
                Passive influence<br/>on your emotion.
              </h4>
            </div>

            {/* Card 2 */}
            <div className="bg-[#f5efe8] border-[2.73px] border-[#5d5d5d] rounded-[36.4px] flex flex-col justify-end w-[342px] h-[399px] p-12">
              <h4 className="font-geist-sans font-medium text-2xl leading-8 text-black tracking-tight max-w-[230px]">
                Talk with your<br/>own body.
              </h4>
            </div>

            {/* Card 3 */}
            <div className="bg-[#f5efe8] border-[2.73px] border-[#5d5d5d] rounded-[36.4px] flex flex-col justify-end w-[375px] h-[399px] p-12">
              <h4 className="font-geist-sans font-medium text-2xl leading-8 text-black tracking-tight max-w-[261px]">
                Personalized<br/>experience that<br/>gets better.
              </h4>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#313233] text-white px-16 pt-10 pb-24">
        <div className="flex justify-between mb-72">
          {/* Column 1 */}
          <div className="flex flex-col max-w-xs">
            <h3 className="font-geist-sans font-bold text-3xl mb-12 tracking-tight">
              MAON
            </h3>
            <p className="font-geist-sans text-xl leading-6 text-[#fcf8f4] mb-24 tracking-tight">
              Get a passive influence on your emotional state and talk with your own today.
            </p>
            <button className="flex items-center gap-2 hover:opacity-70 transition-opacity self-start">
              <span className="font-geist-sans text-xl text-[#fcf8f4] border-b border-[#fcf8f4] pb-1 tracking-tight">
                Download
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
              <h4 className="font-geist-sans text-xl text-[rgba(252,248,244,0.58)] mb-12 tracking-tight">
                NAVIGATE
              </h4>
              <ul className="space-y-12">
                <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Homepage</button></li>
                <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Mission</button></li>
                <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Product</button></li>
                <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Research</button></li>
                <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Contact Us</button></li>
              </ul>
            </div>
            
            {/* Column 3 - Company */}
            <div>
              <h4 className="font-geist-sans text-xl text-[rgba(252,248,244,0.58)] mb-12 tracking-tight">
                COMPANY
              </h4>
              <ul className="space-y-12">
                <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Terms of Service</button></li>
                <li><button className="font-geist-sans text-xl text-[#fcf8f4] hover:opacity-70 transition-opacity tracking-tight">Privacy Policy</button></li>
              </ul>
            </div>
            
            {/* Column 4 - Contact */}
            <div>
              <h4 className="font-geist-sans text-xl text-[rgba(252,248,244,0.58)] mb-12 tracking-tight">
                CONTACT US
              </h4>
              <ul className="space-y-12">
                <li>
                  <a href="mailto:Moan@gmail.com" 
                     className="font-geist-sans text-xl text-[#fcf8f4] underline hover:opacity-70 transition-opacity tracking-tight">
                    Moan@gmail.com
                  </a>
                </li>
                <li>
                  <span className="font-geist-sans text-xl text-[#fcf8f4] tracking-tight">
                    123 - 124 - 1234
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Logo */}
        <div className="text-center">
          <div className="font-geist-sans font-bold text-[200px] text-[#fcf8f4] leading-6 tracking-tight">
            MAON.
          </div>
        </div>
      </footer>
    </div>
  );
}