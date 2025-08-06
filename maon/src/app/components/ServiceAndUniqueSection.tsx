"use client";

import { useState } from "react";

interface FeatureCardProps {
  title: string;
  imageSrc: string;
  videoSrc?: string;
  index: number;
  isHovered: number | null;
  onHover: (index: number | null) => void;
  objectPosition?: string;
  description: string;
}

function FeatureCard({
  title,
  imageSrc,
  videoSrc,
  index,
  isHovered,
  onHover,
  objectPosition = "object-[center_80%]",
  description,
}: FeatureCardProps) {
  const isActive = isHovered === index;
  const isOtherHovered = isHovered !== null && isHovered !== index;

  return (
    <div
      className={`bg-[#f5efe8] border-[2.73px] border-[#5d5d5d] rounded-[36.4px] flex flex-col h-[520px] relative transition-all duration-500 ease-in-out cursor-pointer overflow-hidden ${
        isActive ? "w-[600px] p-12" : isOtherHovered ? "w-[320px] p-5" : "w-[400px] p-5"
      }`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[215px] h-[215px]">
          {/* Image - visible when not hovered */}
          <img
            src={imageSrc}
            alt={title}
            className={`w-[215px] h-[215px] object-cover rounded-lg absolute inset-0 transition-opacity duration-300 ${
              isActive ? "opacity-0" : "opacity-100"
            }`}
          />
          
          {/* Video - visible on hover */}
          {videoSrc && (
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className={`w-[215px] h-[215px] object-cover ${objectPosition} rounded-lg absolute inset-0 transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      </div>
      
      {/* Content area with title and description */}
      <div className="flex flex-col h-[160px] relative mt-4">
        {/* Title - fixed width and center alignment */}
        <h4 className="font-geist-sans font-medium text-[25.48px] leading-[33.5px] text-black tracking-[-0.1422px] text-center w-[300px] mx-auto mb-4">
          {title}
        </h4>
        
        {/* Description - visible on hover with smooth opacity transition */}
        <p
          className={`font-geist-sans text-[16px] leading-[24px] text-black tracking-[-0.1422px] transition-opacity duration-300 ease-in-out w-[280px] mx-auto text-center ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ServiceAndUniqueSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <>
      {/* Service Section */}
      <section className="px-[60px] mt-8">
        <div className="flex gap-[65px] items-start">
          {/* Left side - iPhone mockup */}
          <div className="flex-shrink-0">
            <img
              src="/homescreen.png"
              alt="Maon app interface"
              className="w-[372px] h-[706px] object-cover rounded-[40px]"
            />
          </div>

          {/* Right side - Text content */}
          <div className="flex flex-col pt-[39px]">
            <p className="libre-bodoni-regular text-[30px] text-[#313233] mb-4 tracking-[-0.2333px]">
              The service that we provide
            </p>

            <h3 className="font-geist-sans font-semibold text-[36px] leading-[55px] text-[#313233] mb-8 tracking-[-0.2333px] max-w-[872px]">
              At Moan, we offer a wellness app that not only delivers you AI
              driven metrics, but a way to passively influence your emotions and
              talk with your own body.
            </h3>

            <button className="flex items-center gap-2 hover:opacity-70 transition-opacity self-start">
              <span className="font-geist-sans text-[20px] text-[#313233] border-b border-[#313233] pb-[5px] tracking-[-0.2333px]">
                Learn more
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 7H13M13 7L7 1M13 7L7 13"
                  stroke="#313233"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* What Makes Us Unique Section */}
      <section className="bg-[#f5efe8] mt-[-230px] py-16 px-24 min-h-[729px]">
        <p className="libre-bodoni-regular text-center text-[30px] text-[#313233] mb-8 tracking-[-0.2333px]">
          This is what makes us unique
        </p>

        <div className="relative flex justify-center items-center h-[520px] px-20">
          <div className="relative flex items-center">
            {/* First Card */}
            <div
              className="relative transition-all duration-500 ease-in-out px-8 py-4"
              style={{
                zIndex: hoveredCard === 0 ? 30 : 10,
                marginRight: "-115px",
              }}
            >
              <FeatureCard
                title="Passive influence on your emotion."
                imageSrc="/images/1.png"
                videoSrc="/videos/feature1.mp4"
                index={0}
                isHovered={hoveredCard}
                onHover={setHoveredCard}
                objectPosition="object-[center_80%]"
                description="Science-backed vibrations that help you focus, stay energized, and feel calm throughout your day."
              />
            </div>

            {/* Second Card */}
            <div
              className="relative transition-all duration-500 ease-in-out px-8 py-4"
              style={{
                zIndex: hoveredCard === 1 ? 30 : 20,
                marginRight: "-115px",
              }}
            >
              <FeatureCard
                title="Talk with your own body."
                imageSrc="/images/2.png"
                videoSrc="/videos/feature2.mp4"
                index={1}
                isHovered={hoveredCard}
                onHover={setHoveredCard}
                objectPosition="object-[center_65%]"
                description="Your personal AI health companion learns from your body's signals to answer questions and give personalized wellness advice."
              />
            </div>

            {/* Third Card */}
            <div
              className="relative transition-all duration-500 ease-in-out px-8 py-4"
              style={{
                zIndex: hoveredCard === 2 ? 30 : 15,
              }}
            >
              <FeatureCard
                title="Personalized experience that gets better."
                imageSrc="/images/3.png"
                videoSrc="/videos/feature3.mp4"
                index={2}
                isHovered={hoveredCard}
                onHover={setHoveredCard}
                objectPosition="object-top"
                description="The more you wear it, the better it knows you – adapting vibrations to what works best for your unique body."
              />
            </div>
          </div>
        </div>
        <button className="mt-12 flex items-center ml-auto mr-auto gap-2 hover:opacity-70 transition-opacity self-start">
              <span className="font-geist-sans text-[#313233] border-b border-[#313233] pb-0.5 text-lg tracking-tight transition-all duration-700 group-hover:text-[#fcf8f4] group-hover:border-[#fcf8f4]">
                Look at the Research
              </span>
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-700">
                  <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="#313233" strokeWidth="1.5" className="transition-colors duration-700 group-hover:stroke-[#fcf8f4]"/>
                </svg>
              </span>
            </button>
      </section>
    </>
  );
}
