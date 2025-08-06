"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between px-20 py-6">
      {/* Logo */}
      <div className="flex items-center" onClick={() => router.push("/")}>
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
        <Link
          href="/"
          className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight"
        >Home</Link>
        <Link
          href="/product"
          className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight"
        >
          Product
        </Link>
        <Link
          href="/science"
          className="font-geist-sans font-regular text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight"
        >
          Science
        </Link>
        <Link
          href="/demo"
          className="font-geist-sans font-bold text-base text-[#313233] hover:opacity-70 transition-opacity tracking-tight"
        >
          Demo
        </Link>
      </div>
    </nav>
  );
}
