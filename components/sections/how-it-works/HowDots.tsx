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
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop vs mobile
  useEffect(() => {
    const mql = window.matchMedia
      ? window.matchMedia("(min-width: 768px)")
      : null;

    const update = () => {
      setIsDesktop(mql ? mql.matches : window.innerWidth >= 768);
    };

    update();

    if (mql) {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", update);
      } else {
        (mql as unknown as { addListener?: (cb: () => void) => void }).addListener?.(
          update
        );
      }
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (mql) {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", update);
        } else {
          (
            mql as unknown as { removeListener?: (cb: () => void) => void }
          ).removeListener?.(update);
        }
      } else {
        window.removeEventListener("resize", update);
      }
    };
  }, []);

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
        // Note: opts are capped in DotsCanvas (stiffness/maxSpeed <= 1.6, damping >= 0.95)
        // so we set them to the effective max for a quicker snap.
        burstMs: 220,
        stiffnessMult: 1.6,
        dampingMult: 0.95,
        maxSpeedMult: 1.6,
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

  const targetScale = isDesktop ? 0.8 : 0.6;
  const targetAnchor = isDesktop ? "right-center" : "top-center";

  return (
    <DotsScene
      svgUrl={activeSvgUrl}
      className="h-[600vh]"
      stiffnessMult={4.5}
      dampingMult={0.85}
      maxSpeedMult={2.5}
      snapOnEnter
      targetScale={targetScale}
      targetAnchor={targetAnchor}
      // Faster snap: longer lock/force-home window + higher snap thresholds.
      lockInMs={240}
      homeSnapMs={200}
      swayRampMs={160}
      morphSpeedMult={6.0}
      swayStyle="targetOffset"
      settleRadiusPx={10}
      snapRadiusPx={18}
      snapSpeedPxPerSec={1400}
    />
  );
}

export { svgUrls };
