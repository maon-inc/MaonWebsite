"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between px-20 py-6">
      {/* Logo */}
      <div className="flex items-center"
      onClick={() => router.push("/")}>
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
          Product
        </button>
        <button className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight">
          Science
        </button>
        <button className="font-geist-sans font-bold text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight"
          onClick={() => router.push("/demo")}>
          Demo
        </button>
      </div>
    </nav>
  );
}
