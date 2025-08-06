"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function CarouselSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const researchData = [
    {
      image: "/images/carousel1.png",
      title: "\"I feel it the AI is nervous\": Parasomatic Interaction with AI Agents",
      subtitle: "Pseudo anxiety and trust from haptic is possible"
    },
    {
      image: "/images/carousel2.png",
      title: "Evaluating Doppel's impact on Anxiety and Focus amongst adults with ADHD",
      subtitle: "Heartbeat wristband eased anxiety in ADHD adults."
    },
    {
      image: "/images/carousel3.png",
      title: "Subtle interactions for distress regulation",
      subtitle: "Lowered-heartbeat wrist vibrations relaxed highly neurotic or extraverted users"
    },
    {
      image: "/images/carousel4.png",
      title: "Improving Attention Using Wearables",
      subtitle: "Studies found gentle rhythmic vibrations improved focus and were easy to use."
    },
    {
      image: "/images/carousel5.png",
      title: "Recognizing emotions induced by wearable haptic vibration",
      subtitle: "Brain data shows that vibrations heightened brain responses to emotions."
    },
    {
      image: "/images/carousel6.png",
      title: "Association of the Apollo Wearable With Fatigue",
      subtitle: "Vibrations eased fatigue Improved mood, and sleep Four-week use study"
    },
    {
      image: "/images/carousel7.png",
      title: "Improving Attention Using Wearables",
      subtitle: "Studies found gentle rhythmic vibrations improved focus and were easy to use."
    },
    {
      image: "/images/carousel8.png",
      title: "Recognizing emotions induced by wearable haptic vibration",
      subtitle: "Brain data shows that vibrations heightened brain responses to emotions."
    }
  ];

  // Use CSS custom property for transform (much more performant)
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      
      // Update progress state for the progress bar
      setProgress(scrollProgress);
      
      // Update CSS variable for carousel transform
      if (trackRef.current) {
        trackRef.current.style.setProperty('--progress', `${scrollProgress * -80}%`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section 
      ref={sectionRef}
      className="h-[300vh] relative"
    >
      <div className="sticky top-0 h-screen bg-[#F2DDCE] overflow-hidden">
        {/* Title */}
        <div className="absolute top-16 left-20 z-10">
          <h2 className="font-geist-sans font-semibold text-4xl text-[#313233] tracking-tight">
            Research behind the technology
          </h2>
        </div>

        {/* Carousel wrapper */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            ref={trackRef}
            className="flex gap-[4vmin] cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: 'translateX(calc(50% + var(--progress, 0)))',
              transition: isDragging ? 'none' : 'transform 0.1s linear',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {researchData.map((item, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 rounded-lg overflow-hidden"
                style={{
                  width: '30vmin',
                  height: '42vmin',
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={item.image}
                    alt={`Research ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="30vmin"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
                
                <div className="absolute top-4 left-4 right-4 pointer-events-none">
                  <h3 className="font-geist-sans font-semibold text-white text-lg leading-tight">
                    {item.title}
                  </h3>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <p className="font-geist-sans text-white text-sm leading-tight">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <div className="w-32 h-1 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#313233] transition-all duration-300"
              style={{ 
                width: `${progress * 100}%`,
              }}
            />
          </div>
          
          <span className="text-sm font-geist-sans text-[#313233]">
            {progress >= 0.99 ? 'Scroll to continue' : 'Scroll to explore research'}
          </span>
        </div>
      </div>
    </section>
  );
}