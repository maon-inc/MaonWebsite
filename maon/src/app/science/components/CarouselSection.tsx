"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function CarouselSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragStartTranslate, setDragStartTranslate] = useState(0);
  
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

  // Simple scroll-based movement
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Calculate progress through the section
      if (sectionTop <= 0 && sectionTop > -(sectionHeight - windowHeight)) {
        // How far we've scrolled into this section (0 to 1)
        // We need to account for the viewport height in the calculation
        const maxScroll = sectionHeight - windowHeight;
        const currentScroll = Math.abs(sectionTop);
        const scrollProgress = Math.min(currentScroll / maxScroll, 1);
        // Map to carousel movement (0 to -80)
        const newTranslate = scrollProgress * -80;
        setTranslateX(newTranslate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragStartTranslate(translateX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const newTranslate = dragStartTranslate + (deltaX * 0.1);
      const bounded = Math.max(-80, Math.min(0, newTranslate));
      setTranslateX(bounded);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, dragStartTranslate]);

  const progress = Math.abs(translateX / 80);

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

        {/* Carousel Track */}
        <div 
          className="absolute left-1/2 top-1/2 flex gap-[4vmin] select-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${translateX}%, -50%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
          onMouseDown={handleMouseDown}
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
                alt={`Research ${index + 1}`}
                fill
                className="object-cover"
                sizes="30vmin"
                priority={index < 3}
              />
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
              
              <div className="absolute top-4 left-4 right-4">
                <h3 className="font-geist-sans font-semibold text-white text-lg leading-tight">
                  {item.title}
                </h3>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-geist-sans text-white text-sm leading-tight">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <div className="w-32 h-1 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#313233] transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          
          <span className="text-sm font-geist-sans text-[#313233]">
            {progress >= 0.99 ? 'Scroll down to continue' : 'Scroll to explore research'}
          </span>
        </div>
      </div>
    </section>
  );
}