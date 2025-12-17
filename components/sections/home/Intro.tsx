"use client";

import Image from "next/image";

export default function Intro() {
  return (
    <div className="flex items-center justify-center px-6 md:px-12 h-full">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:gap-16 max-w-[1200px] mx-auto">
        {/* Image on the left */}
        <div className="flex-shrink-0">
          <Image
            src="/assets/intro_pic.png"
            alt="Flow Ring and App"
            width={400}
            height={600}
            className="w-[200px] md:w-[300px] h-auto"
            priority
          />
        </div>

        {/* Text content on the right */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 max-w-[500px]">
          <h2 className="text-m-merriweather-30-regular md:text-d-merriweather-40-regular italic">
            Introducing the
            <br />
            Flow Ring
          </h2>
          <p className="text-d-lato-24-regular md:text-d-lato-24-regular">
            When you feel off, we&apos;ll guide your body back to balance with
            subtle, intelligent haptic cues &amp; app limits.
          </p>
          <a
            href="/how-it-works"
            className="inline-flex items-center gap-2 px-5 py-2.5 w-fit text-m-lato-16-regular md:text-d-lato-20-regular"
            style={{
              border: "0.9px solid black",
              borderRadius: "11.28px",
              backgroundColor: "#D1EBF7",
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
