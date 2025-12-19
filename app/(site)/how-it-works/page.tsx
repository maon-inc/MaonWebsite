"use client";

import { useState, useCallback } from "react";
import DotsCanvas from "@/components/motion/DotsCanvas";
import DotsScene from "@/components/motion/DotsScene";
import How from "@/components/sections/how-it-works/How";
import HowDots from "@/components/sections/how-it-works/HowDots";
import SaveSpot from "@/components/sections/home/SaveSpot";
import Footer from "@/components/site/Footer";
import { setScrollContainer } from "@/motion/engine";

export default function HowItWorksPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const setScrollEl = useCallback((node: HTMLDivElement | null) => {
    setScrollContainer(node);
  }, []);

  return (
    <DotsCanvas
      count={1200}
      targetWidth={500}
      targetHeight={500}
      targetAnchor="center"
    >
      <div className="relative w-full min-h-screen flex flex-col">
        <main className="relative w-full h-screen overflow-hidden flex-shrink-0">
          <div className="relative z-10 flex h-screen">
            <div
              ref={setScrollEl}
              className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar"
            >
              <How onIndexChange={setActiveIndex}>
                <HowDots activeIndex={activeIndex} />
              </How>

              <section className="relative grid h-[200vh]">
                <div className="pointer-events-none col-start-1 row-start-1">
                  <DotsScene dissipate className="h-[200vh]" morphSpeedMult={2} stiffnessMult={2} targetAnchor="center" />
                </div>

                <div className="sticky top-0 h-screen flex items-center justify-center col-start-1 row-start-1">
                  <SaveSpot />
                </div>
              </section>

              {/* Footer - inside scrollable content */}
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </DotsCanvas>
  );
}
