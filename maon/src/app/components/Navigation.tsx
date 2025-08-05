import Image from "next/image";

export default function Navigation() {
  return (
    <nav className="flex items-center justify-between px-16 py-6">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="MAON Logo"
          width={40}
          height={40}
          priority
        />
      </div>
      
      {/* Right Side Navigation */}
      <div className="flex items-center gap-16">
        <button className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
          Mission
        </button>
        <button className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
          Products
        </button>
        <button className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
          Research
        </button>
        <button className="font-geist-sans font-bold text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
          Demo
        </button>
      </div>
    </nav>
  );
}