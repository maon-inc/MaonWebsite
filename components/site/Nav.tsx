import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex flex-col items-end gap-12 pt-[100px] h-screen">
      {/* Logo */}
      <div className="relative w-[40px] h-auto">
        <Image
          src="/assets/logo.svg"
          alt="MAON"
          width={72}
          height={69}
          className="w-full h-full"
          priority
        />
      </div>

      {/* Links */}
      <div className="flex flex-col items-end gap-10 mt-60">
        <Link
          href="/our-story"
          className="text-d-lato-20-regular relative group transition-opacity hover:opacity-80"
        >
          Our Story
          <span className="absolute bottom-0 right-0 w-[29px] h-[2px] bg-foreground opacity-30 group-hover:opacity-60 transition-opacity" />
        </Link>
        <Link
          href="/how-it-works"
          className="text-d-lato-20-regular relative group transition-opacity hover:opacity-80"
        >
          How it Works
          <span className="absolute bottom-0 right-0 w-[29px] h-[2px] bg-foreground opacity-30 group-hover:opacity-60 transition-opacity" />
        </Link>
        <Link
          href="/preorder"
          className="text-d-lato-20-bold relative group transition-opacity hover:opacity-80"
        >
          Save Your Spot
          <span className="absolute bottom-0 right-0 w-[130px] h-[2px] bg-foreground" />
        </Link>
      </div>

      {/* Footer text */}
      <div className="flex flex-col items-end gap-1 mt-auto">
        <div
          className="text-[20px] font-normal text-[#8C8C8C]"
          style={{
            fontFamily: "var(--font-lato), Arial, Helvetica, sans-serif",
          }}
        >
          MAON
        </div>
        <div className="text-d-merriweather-20-regular text-[#8C8C8C] text-right w-[250px]">
          A gentle redirection in a noisy world.
        </div>
      </div>
    </nav>
  );
}
