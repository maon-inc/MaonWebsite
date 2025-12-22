"use client";

import Image from "next/image";

export default function SaveSpot() {
  return (
    <div className="flex items-center justify-center px-6 md:px-12 h-full">
      <div className="flex flex-col items-center text-center gap-6 max-w-[600px] mx-auto">
        <h2 className="serif-400-40 whitespace-pre-line">
          Save your spot.{"\n"}
          Coming December 2026.
        </h2>
        <a
          href="/waitlist"
          className="inline-flex items-center gap-2 px-5 py-2.5 w-fit sans-400-16 md:sans-400-20 !text-black"
          style={{
            border: "0.9px solid black",
            borderRadius: "11.28px",
            backgroundColor: "#D1EBF7",
            color: "black",
          }}
        >
          Save your spot
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
  );
}


