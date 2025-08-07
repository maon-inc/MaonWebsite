"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

export default function CarouselSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [parallaxOffsets, setParallaxOffsets] = useState<number[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastProgressRef = useRef<number>(0);
  const lastDragTime = useRef<number>(0);
  
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

  // Callback ref pattern for better ref management
  const setCardRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(index, el);
    } else {
      cardRefs.current.delete(index);
    }
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate parallax offsets for each card
  const calculateParallaxOffsets = useCallback(() => {
    if (prefersReducedMotion || !trackRef.current) {
      setParallaxOffsets([]);
      return;
    }

    const newOffsets: number[] = [];
    cardRefs.current.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const viewportCenter = window.innerWidth / 2;
      const cardCenter = cardRect.left + cardRect.width / 2;
      
      const distanceFromCenter = (cardCenter - viewportCenter) / window.innerWidth;
      const easedDistance = Math.sign(distanceFromCenter) * Math.pow(Math.abs(distanceFromCenter), 0.7);
      
      newOffsets[index] = easedDistance * 30;
    });
    
    setParallaxOffsets(newOffsets);
  }, [prefersReducedMotion]);

  // Main scroll handler using RAF for smooth animation
  const handleScroll = useCallback(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      
      // Only update if progress actually changed meaningfully
      const progressDiff = Math.abs(scrollProgress - lastProgressRef.current);
      if (progressDiff > 0.001) {
        setProgress(scrollProgress);
        
        if (trackRef.current) {
          trackRef.current.style.setProperty('--progress', `${scrollProgress * -80}%`);
        }
        
        calculateParallaxOffsets();
        lastProgressRef.current = scrollProgress;
      }
      
      animationFrameRef.current = null;
    });
  }, [calculateParallaxOffsets]);

  // Resize handler
  const handleResize = useCallback(() => {
    calculateParallaxOffsets();
  }, [calculateParallaxOffsets]);

  useEffect(() => {
    // Initial setup
    handleScroll();
    setTimeout(() => calculateParallaxOffsets(), 100); // Delay for image loading
    
    // Add listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleScroll, handleResize, calculateParallaxOffsets]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    trackRef.current.scrollLeft = scrollLeft - walk;
    
    // Throttle parallax during drag
    const now = Date.now();
    if (now - lastDragTime.current > 16) {
      calculateParallaxOffsets();
      lastDragTime.current = now;
    }
  }, [isDragging, startX, scrollLeft, calculateParallaxOffsets]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    
    const x = e.touches[0].pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    trackRef.current.scrollLeft = scrollLeft - walk;
    
    // Throttle parallax during touch
    const now = Date.now();
    if (now - lastDragTime.current > 16) {
      calculateParallaxOffsets();
      lastDragTime.current = now;
    }
  }, [isDragging, startX, scrollLeft, calculateParallaxOffsets]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

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
              transition: isDragging ? 'none' : 'transform 0.05s ease-out',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {researchData.map((item, index) => (
              <div
                key={index}
                ref={setCardRef(index)}
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
                    style={{
                      objectPosition: prefersReducedMotion 
                        ? '50% 50%' 
                        : `${50 - (parallaxOffsets[index] || 0)}% 50%`,
                      willChange: isDragging ? 'object-position' : 'auto',
                      transition: prefersReducedMotion ? 'none' : 'object-position 0.1s ease-out',
                    }}
                    sizes="(max-width: 768px) 50vw, 30vmin"
                    priority={index < 3}
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