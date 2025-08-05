"use client";

import Lottie from "lottie-react";
import logoAnimation from "../../../public/animations/logo/moving_logo.json";

export default function HeroSection() {
  return (
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
            className="w-full h-full opacity-30"
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
  );
}