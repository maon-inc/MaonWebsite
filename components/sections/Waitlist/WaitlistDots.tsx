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
      morphSpeedMult={2}
      stiffnessMult={2}
      snapOnEnter
      targetAnchor={targetAnchor}
      targetScale={targetScale}
    >
      {children}
    </DotsScene>
  );
}
