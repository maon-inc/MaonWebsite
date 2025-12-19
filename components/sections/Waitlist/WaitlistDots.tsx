"use client";

import DotsScene from "@/components/motion/DotsScene";
import { useIsDesktop } from "@/hooks/useIsDesktop";

interface WaitlistDotsProps {
  children?: React.ReactNode;
}

export default function WaitlistDots({ children }: WaitlistDotsProps) {
  const isDesktop = useIsDesktop();

  const targetAnchor = isDesktop ? "center-left" : "top-center";
  const targetScale = isDesktop ? 1.1 : 0.5;

  return (
    <DotsScene
      svgUrl="/assets/hero_svg.svg"
      className="relative min-h-screen"
      scrollStartOffset={-200}
      morphSpeedMult={6}
      stiffnessMult={4.5}
      dampingMult={0.85}
      maxSpeedMult={2.5}
      snapOnEnter
      targetAnchor={targetAnchor}
      targetScale={targetScale}
      lockInMs={240}
      homeSnapMs={200}
      swayRampMs={160}
      settleRadiusPx={10}
      snapRadiusPx={18}
      snapSpeedPxPerSec={1400}
    >
      {children}
    </DotsScene>
  );
}
