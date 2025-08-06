"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function CarouselSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [percentage, setPercentage] = useState(0);
  const percentageRef = useRef(0);
  const [isInView, setIsInView] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [prevPercentage, setPrevPercentage] = useState(0);

  // Keep ref in sync with state
  useEffect(() => {
    percentageRef.current = percentage;
  }, [percentage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    if (!section) return;

    let scrollBlockingActive = false;

    // Handle wheel events to hijack vertical scrolling
    const handleWheel = (e: WheelEvent) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;
      
      // More precise section detection - only when section is actively in view
      const sectionInView = sectionTop < windowHeight && sectionBottom > 0;
      const atSectionCenter = sectionTop <= 0 && sectionBottom >= windowHeight;
      
      // Only hijack when we're clearly in the section view
      if (!sectionInView || isDragging) {
        scrollBlockingActive = false;
        return; // Allow normal scrolling
      }
      
      // Get current percentage values from ref to avoid stale closure
      const currentPercentage = percentageRef.current;
      const carouselComplete = currentPercentage <= -79;
      const carouselAtStart = currentPercentage >= 0;
      
      // Handle downward scrolling
      if (e.deltaY > 0) {
        // Only hijack if we're centered in the section AND carousel not complete
        if (atSectionCenter && !carouselComplete) {
          e.preventDefault();
          e.stopPropagation();
          scrollBlockingActive = true;
          
          const scrollAmount = Math.abs(e.deltaY) * 0.05;
          const newPercentage = currentPercentage - scrollAmount;
          setPercentage(Math.max(Math.min(newPercentage, 0), -80));
        }
        // Allow scrolling if carousel complete or not centered
        else {
          scrollBlockingActive = false;
        }
      }
      // Handle upward scrolling  
      else if (e.deltaY < 0) {
        // Only hijack if we're centered in the section AND carousel not at start
        if (atSectionCenter && !carouselAtStart) {
          e.preventDefault();
          e.stopPropagation();
          scrollBlockingActive = true;
          
          const scrollAmount = Math.abs(e.deltaY) * 0.05;
          const newPercentage = currentPercentage + scrollAmount;
          setPercentage(Math.max(Math.min(newPercentage, 0), -80));
        }
        // Allow scrolling if carousel at start or not centered
        else {
          scrollBlockingActive = false;
        }
      }
    };

    // Handle regular scroll events for state management only
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;
      
      setIsInView(sectionTop < windowHeight && sectionBottom > 0);
      
      // Reset percentage when scrolling back above section
      if (sectionTop > windowHeight) {
        setPercentage(0);
      }
      
      // Don't force scroll back - this was causing the blinking issue
      // Let the wheel handler control the scrolling behavior
    };

    // Also handle touchmove for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (scrollBlockingActive) {
        e.preventDefault();
      }
    };

    // Use passive: false to allow preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging]);

  // Handle mouse/touch drag
  const handleOnDown = (clientX: number) => {
    if (!isInView) return;
    setIsDragging(true);
    setStartX(clientX);
    setPrevPercentage(percentage);
  };

  const handleOnUp = () => {
    setIsDragging(false);
    setPrevPercentage(percentage);
  };

  const handleOnMove = (clientX: number) => {
    if (!isDragging || !isInView) return;
    
    const mouseDelta = startX - clientX;
    const maxDelta = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
    
    const deltaPercentage = (mouseDelta / maxDelta) * -100;
    const nextPercentage = Math.max(Math.min(prevPercentage + deltaPercentage, 0), -80);
    
    setPercentage(nextPercentage);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMouseDown = (e: MouseEvent) => handleOnDown(e.clientX);
    const onTouchStart = (e: TouchEvent) => handleOnDown(e.touches[0].clientX);
    const onMouseUp = () => handleOnUp();
    const onTouchEnd = () => handleOnUp();
    const onMouseMove = (e: MouseEvent) => handleOnMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleOnMove(e.touches[0].clientX);

    const track = trackRef.current;
    if (track) {
      track.addEventListener("mousedown", onMouseDown);
      track.addEventListener("touchstart", onTouchStart);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchend", onTouchEnd);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove);

      return () => {
        track.removeEventListener("mousedown", onMouseDown);
        track.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchmove", onTouchMove);
      };
    }
  }, [isDragging, startX, prevPercentage, isInView]);

  const researchData = [
    {
      image: "/images/carousel1.png",
      title: "\"I feel it the AI is nervous\"",
      subtitle: "Parasomatic Interaction with AI Agents"
    },
    {
      image: "/images/carousel2.png",
      title: "Pseudo anxiety and trust from haptic is possible",
      subtitle: "Evaluating Doppel's impact on Anxiety and Focus amongst adults with ADHD"
    },
    {
      image: "/images/carousel3.png",
      title: "Subtle interactions for distress regulation",
      subtitle: "efficiency of a haptic wearable according to personality"
    },
    {
      image: "/images/carousel4.png",
      title: "Improving Attention Using Wearables",
      subtitle: "via Haptic and Multimodal Rhythmic Stimuli"
    },
    {
      image: "/images/carousel5.png",
      title: "Recognizing emotions induced by wearable haptic vibration",
      subtitle: "using noninvasive electroencephalogram"
    },
    {
      image: "/images/carousel6.png",
      title: "Association of the Apollo Wearable With Fatigue",
      subtitle: "Raynaud Phenomenon, and Quality of Life in Patients With Systemic Sclerosis"
    },
    {
      image: "/images/carousel7.png",
      title: "Brain data shows vibrations heightened responses",
      subtitle: "Studies found gentle rhythmic vibrations improved focus and were easy to use"
    },
    {
      image: "/images/carousel8.png",
      title: "Vibrations eased fatigue and improved mood",
      subtitle: "Four-week use study showing improved sleep and quality of life"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative h-[200vh] bg-[#F2DDCE]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Title */}
        <div className="absolute top-16 left-20 z-10">
          <h2 className="font-geist-sans font-semibold text-4xl text-[#313233] tracking-tight">
            Research behind the technology
          </h2>
        </div>
        <div 
          ref={trackRef}
          className="absolute left-1/2 top-1/2 flex gap-[4vmin] select-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${percentage}%, -50%)`,
            transition: isDragging ? 'none' : 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {researchData.map((item, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 rounded-lg overflow-hidden pointer-events-none"
              style={{
                width: '30vmin',
                height: '42vmin',
              }}
            >
              <Image
                src={item.image}
                alt={`Research image ${index + 1}`}
                fill
                className="object-cover"
                style={{
                  objectPosition: `${100 + percentage}% center`,
                  transition: isDragging ? 'none' : 'object-position 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
                sizes="30vmin"
                priority={index < 3}
              />
              
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
              
              {/* Title - Top Left */}
              <div className="absolute top-4 left-4 max-w-[calc(100%-2rem)]">
                <h3 className="font-geist-sans font-semibold text-white text-[24px] leading-tight tracking-tight">
                  {item.title}
                </h3>
              </div>
              
              {/* Subtitle - Bottom Right */}
              <div className="absolute bottom-4 right-4 max-w-[calc(100%-2rem)] text-right">
                <p className="font-geist-sans font-regular text-white text-[15px] leading-tight tracking-tight">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress and Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
          {/* Progress Bar */}
          <div className="w-32 h-1 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#313233] transition-all duration-300 ease-out"
              style={{
                width: `${Math.abs(percentage / 80) * 100}%`
              }}
            />
          </div>
          
          {/* Text Indicator */}
          <div 
            className="flex items-center gap-2 text-[#313233] transition-opacity duration-300"
            style={{
              opacity: percentage <= -79 ? 0 : 1
            }}
          >
            <span className="text-sm font-geist-sans tracking-tight">
              {percentage <= -79 
                ? 'Complete - scroll to continue' 
                : isInView 
                ? 'Drag or scroll to explore' 
                : 'Scroll to explore'
              }
            </span>
            {percentage <= -79 ? (
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6 10L8.5 12.5L14 7" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="animate-pulse"
              >
                <path 
                  d="M5 10L10 10M10 10L15 10M10 10L10 5M10 10L10 15" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}