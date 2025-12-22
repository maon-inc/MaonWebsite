"use client";

import Image from "next/image";

export default function Intro() {
  return (
    <div className="flex items-center justify-center px-6 md:px-12 h-full">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:gap-16 max-w-[1200px] mx-auto -mt-16 md:-mt-12">
        {/* Image on the left */}
        <div className="flex-shrink-0">
          <Image
            src="/assets/intro_pic.png"
            alt="Flow Ring and App"
            width={300}
            height={500}
            className="pl-5 w-[170px] md:w-[300px] h-auto"
            priority
          />
        </div>

        {/* Text content on the right */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 max-w-[500px]">
          <h2 className="mt-[-12px] md:mt-0 serif-400-32 md:serif-400-40 italic mb-1">
            Introducing the
            <br />
            Flow Ring
          </h2>
          {/* Mobile copy */}
          <p className="md:hidden sans-400-24 pb-2">
            When you feel off, we&apos;ll guide your body back to balance with
            passive interventions.
          </p>
          {/* Desktop copy (unchanged) */}
          <p className="hidden md:block sans-400-24 pb-2">
          When you feel off, we&apos;ll guide your body back to balance with
          subtle, intelligent haptic cues &amp; app limits.
          </p>
          <a
            href="/how-it-works"
            className="inline-flex items-center gap-2 px-5 py-2.5 w-fit sans-400-16 md:sans-400-20 !text-black -mt-[.5px]"
            style={{
              border: "0.9px solid black",
              borderRadius: "11.28px",
              backgroundColor: "#D1EBF7",
              color: "black",
            }}
          >
            Learn more
            <Image
              src="/assets/ui/solar_arrow-up-broken.svg"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
