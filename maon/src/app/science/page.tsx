"use client";

import { Navigation, Footer } from "../components";
import { HeroSection, WhatThisMeansSection, CarouselSection } from "./components";

export default function SciencePage() {
  return (
    <div className="min-h-screen bg-[#fcf8f4]">
      <Navigation />
      
      <main className="flex flex-col">
        <HeroSection />
        <WhatThisMeansSection />
        <CarouselSection />
      </main>

      <Footer />
    </div>
  );
}