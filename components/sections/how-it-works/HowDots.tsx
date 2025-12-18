"use client";

import { useEffect, useRef, useState } from "react";
import DotsScene from "@/components/motion/DotsScene";
import { retargetToSvg } from "@/components/motion/DotsCanvas";

const svgUrls = [
  "/assets/how_it_works/1.svg",
  "/assets/how_it_works/2.svg",
  "/assets/how_it_works/3.svg",
];

interface HowDotsProps {
  activeIndex: number;
}

export default function HowDots({ activeIndex }: HowDotsProps) {
  const [activeSvgUrl, setActiveSvgUrl] = useState<string | null>(null);
  const prevSvgUrlRef = useRef<string | null>(null);

  // Handle SVG transitions when activeIndex changes
  // Index 0 = scatter scene, indices 1-3 = SVGs
  useEffect(() => {
    if (activeIndex === 0) {
      // Scatter scene for "How it works"
      if (prevSvgUrlRef.current !== null) {
        prevSvgUrlRef.current = null;
        setActiveSvgUrl(null);
      }
      return;
    }

    // Map activeIndex 1,2,3 to SVG indices 0,1,2
    const svgIndex = activeIndex - 1;
    const svgUrl = svgUrls[svgIndex];
    if (!svgUrl) return;

    if (svgUrl !== prevSvgUrlRef.current) {
      const prevIndex = prevSvgUrlRef.current 
        ? svgUrls.indexOf(prevSvgUrlRef.current)
        : -1;
      const goingUp = svgIndex < prevIndex;
      prevSvgUrlRef.current = svgUrl;
      setActiveSvgUrl(svgUrl);

      retargetToSvg(svgUrl, goingUp ? "snap" : "soft", {
        burstMs: 100,
        stiffnessMult: 3.5,
        dampingMult: 0.88,
        maxSpeedMult: 2.5,
      });
    }
  }, [activeIndex]);

  // Show scatter for index 0, SVG scenes for indices 1-3
  if (activeIndex === 0) {
    return (
      <DotsScene
        scatter
        className="h-[600vh]"
        stiffnessMult={4.5}
        dampingMult={0.85}
        maxSpeedMult={2.5}
        targetAnchor="top-center"
      />
    );
  }

  if (!activeSvgUrl) return null;

  return (
    <DotsScene
      svgUrl={activeSvgUrl}
      className="h-[600vh]"
      stiffnessMult={4.5}
      dampingMult={0.85}
      maxSpeedMult={2.5}
      snapOnEnter
      targetScale={0.8}
      targetAnchor="right-center"
      lockInMs={150}
      homeSnapMs={100}
      swayRampMs={300}
      morphSpeedMult={6.0}
      swayStyle="targetOffset"
      settleRadiusPx={8}
      snapRadiusPx={10}
      snapSpeedPxPerSec={450}
    />
  );
}

export { svgUrls };
