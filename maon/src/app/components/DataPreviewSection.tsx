"use client";

import React from "react";
import Image from "next/image";

// Update these filenames to match your public/ directory
const chartImages = [
  "/summary.png",
  "/summary2.png",
  "/hrv.png",
  "/hr.png",
  "/temp.png",
  "/eda.png",
  "/text-card.png",
];

// Replace with the image you want for the Ideal Score
const idealChart = "/placeholder_main.png";

export const DataPreviewSection: React.FC = () => (
  <section id="data" className="py-16">
    <div className="mx-auto max-w-7xl px-4">
      <p className="libre-bodoni-regular text-center text-[30px] text-[#313233] mb-8 tracking-[-0.2333px]">
        Maon gives you everything you need to know
      </p>

      {/* Top infinite marquee of images */}
      <div className="relative overflow-hidden h-40">
        {/* Centered marquee strip container */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-screen">
          <div className="flex items-center space-x-4 animate-marquee opacity-70">
            {[...chartImages, ...chartImages].map((src, idx) => (
              <div key={idx} className="flex-shrink-0 h-32">
                <Image
                  src={src}
                  alt={`Chart ${idx + 1}`}
                  height={128}
                  width={256}
                  className="h-32 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid: Ideal score image + description */}
      <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-[40%_60%]">
        <div className="rounded-full flex items-center justify-center">
          {/* Auto-height image wrapper */}
          <div className="w-full">
            <Image
              src="/summary.png"
              alt="Maon Ideal Score"
              width={1000}
              height={600}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
              className="rounded-3xl"
            />
          </div>
        </div>
        <div className="rounded-[32px] bg-[#DDD8D2] p-4 sm:p-8 md:p-10 flex flex-col justify-center">
          <h3 className="mb-4 text-3xl italic font-libre-bodoni">
            Maon Ideal Score
          </h3>
          <p className="text-xl leading-relaxed">
            Our Ideal Score represents the optimal physiological state, derived
            from a comprehensive set of evidence-based health metrics. We
            analyze the data collected by your Apple Watch with our AI engine to
            quantify how closely your current readings align with that ideal.
          </p>
        </div>
      </div>

      {/* Inline marquee keyframes */}
      <style jsx>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  </section>
);

export default DataPreviewSection;
