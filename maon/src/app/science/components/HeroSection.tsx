"use client";

import Lottie from "lottie-react";
import logoAnimation from "../../../../public/animations/logo/moving_logo.json";

export default function HeroSection() {
  return (
    <section className="relative px-20 py-24">
      <div className="max-w-7xl mx-auto flex items-start justify-between">
        {/* Left Side - Title and Subtitle */}
        <div className="flex-1 max-w-3xl">
          <h1 className="font-['Libre_Bodoni'] text-[92px] leading-[100px] text-[#313233] mb-12">
            The <span className="italic">Science.</span>
          </h1>
          
          <p className="font-geist-sans text-3xl leading-[45px] text-[#313233] tracking-tight mb-10">
            Every Maon feature is backed by{" "}
            <span className="font-bold">real science.</span> We follow
            rigorous research standards to ensure our haptic technology
            actually works, not just sounds good.
          </p>
        </div>

        {/* Right Side - Logo Animation */}
        <div className="absolute right-0 top-0 w-[750px] h-[650px] overflow-hidden">
          <Lottie
            animationData={logoAnimation}
            loop={true}
            className="w-full h-full opacity-20"
          />
        </div>
      </div>
    </section>
  );
} 