import Image from 'next/image';

export default function Row1() {
  return (
    <div className="relative w-full h-[80vh] flex items-center justify-center">
      {/* Decorative SVGs */}
      <div className="absolute top-[8%] left-[16%] w-32 h-32">
        <Image src="/product/deco1.svg" alt="" fill className="object-contain" />
      </div>
      
      <div className="absolute bottom-[10%] left-[12%] w-36 h-36">
        <Image src="/product/deco2.svg" alt="" fill className="object-contain" />
      </div>
      
      <div className="absolute top-[20%] right-[15%] w-32 h-32">
        <Image src="/product/deco3.svg" alt="" fill className="object-contain" />
      </div>

      {/* Center content with grey card background */}
      <div className="relative">
        {/* Grey card behind */}
        <div className="absolute inset-0 bg-gray-400 rounded-[30px] transform scale-110 -z-10" />
        
        {/* Main image */}
        <div className="relative w-[200px] h-[240px]">
          <Image src="/product/1.png" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Text content positioned to the right */}
      <div className=" w-[450px] ml-[50px] z-10">
        <h2 className="text-[58px] font-bold italic font-serif leading-[57px] mb-[36px] text-black">
          Just Click!
        </h2>
        <p className="text-[36px] font-medium leading-[42px] text-black">
          Maon will passively regulate your body for you with research-approved haptic interventions
        </p>
      </div>
    </div>
  );
}