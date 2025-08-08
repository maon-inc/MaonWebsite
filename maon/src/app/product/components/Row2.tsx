'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function Row2() {
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#F0E6DC] relative w-full h-[80vh] flex items-center justify-center">
      {/* Decorative SVGs */}
      <div ref={deco1Ref} className="absolute top-[8%] left-[14%] w-20 h-20 transition-transform duration-75 ease-linear">
        <Image src="/product/deco1.svg" alt="" fill className="object-contain" />
      </div>
      
      <div ref={deco2Ref} className="absolute bottom-[10%] right-[10%] w-36 h-36 transition-transform duration-75 ease-linear">
        <Image src="/product/deco3.svg" alt="" fill className="object-contain" />
      </div>
      
      <div ref={deco3Ref} className="absolute top-[12%] right-[23%] z-10 w-16 h-16 transition-transform duration-75 ease-linear">
        <Image src="/product/deco2.svg" alt="" fill className="object-contain" />
      </div>

      {/* Text content positioned to the left */}
      <div className="w-[450px] mr-[50px] z-10 text-right">
        <h2 className="text-[58px] font-bold italic font-serif leading-[57px] mb-[36px] text-black">
          Understand your stress
        </h2>
        <p className="text-[36px] font-medium leading-[42px] text-black">
          Maon reads your body's signals to show you exactly how you're feeling and provides AI suggestions to help you feel better.
        </p>
      </div>

      {/* Center content with grey card background */}
      <div className="relative">
        {/* Grey card behind */}
        <div className="absolute inset-0 bg-gray-400 rounded-[30px] transform scale-x-110 scale-y-125 -z-10" />
        
        {/* Main image */}
        <div className="relative w-[400px] h-[450px]">
          <Image src="/product/2.png" alt="" fill className="object-contain" />
        </div>
      </div>
    </div>
  );
}