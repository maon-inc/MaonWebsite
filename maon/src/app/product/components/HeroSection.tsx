import Image from "next/image";

export default function HeroSection() {
  return (
    <section 
      className="relative min-h-screen overflow-hidden px-[100px] py-[50px]"
      style={{
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.43) 100%), linear-gradient(107.32deg, rgb(136, 157, 144) 38.928%, rgb(95, 149, 156) 98.082%)'
      }}
    >
      {/* Title and Subtitle */}
      <div className="">
        <h1 className="font-serif text-[92.8px] text-[#313233] leading-tight">
          The <span className="italic">Product.</span>
        </h1>
        <p className="font-sans text-[32px] text-[#313233] max-w-[800px] leading-[35px]">
          Maon uses specific, research-based vibrations on your Apple Watch (and soon, a smart ring) to help with fatigue, anxiety, stress, and a whole lot of other emotions.
        </p>
      </div>

      {/* Hero Image */}
      <div className="mt-[-10px] ml-[100px] flex justify-center">
        <Image
          src="/product/hero_screen.png"
          alt="MAON Product Hero"
          width={1200}
          height={700}
          className="object-contain"
        />
      </div>
    </section>
  );
}