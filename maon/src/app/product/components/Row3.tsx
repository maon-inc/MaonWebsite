"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Row3() {
  const deco1Ref = useRef<HTMLDivElement>(null);
  const deco2Ref = useRef<HTMLDivElement>(null);
  const deco3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const rotationAngle = scrollY * 0.1; // Adjust speed as needed

      if (deco1Ref.current) {
        deco1Ref.current.style.transform = `rotate(${rotationAngle}deg)`;
      }
      if (deco2Ref.current) {
        deco2Ref.current.style.transform = `rotate(${rotationAngle}deg)`;
      }
      if (deco3Ref.current) {
        deco3Ref.current.style.transform = `rotate(${rotationAngle}deg)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-[80vh] flex items-center justify-center">
      {/* Decorative SVGs */}
      <div
        ref={deco1Ref}
        className="absolute top-[8%] left-[20%] w-20 h-20 z-10 transition-transform duration-75 ease-linear"
      >
        <Image
          src="/product/deco3.svg"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      <div
        ref={deco2Ref}
        className="absolute bottom-[10%] right-[10%] w-36 h-36 transition-transform duration-75 ease-linear"
      >
        <Image
          src="/product/deco2.svg"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      <div
        ref={deco3Ref}
        className="absolute top-[20%] right-[25%] w-16 h-16 transition-transform duration-75 ease-linear"
      >
        <Image
          src="/product/deco1.svg"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Center content with grey card background */}
      <div className="relative">
        {/* Grey card behind */}
        <div className="absolute inset-0 bg-gray-400 rounded-[30px] transform scale-x-110 scale-y-125 -z-10" />

        {/* Main image */}
        <div className="relative w-[400px] h-[450px]">
          <Image src="/product/3.png" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Text content positioned to the right */}
      <div className="w-[450px] ml-[50px] z-10">
        <h2 className="text-[58px] font-bold italic font-serif leading-[57px] mb-[36px] text-black">
          Chat with your body
        </h2>
        <p className="text-[36px] font-medium leading-[42px] text-black">
          Talk with AI that learns your unique emotion patterns
        </p>
      </div>
    </div>
  );
}
