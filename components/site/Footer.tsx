import Link from "next/link";

export default function Footer() {
  const textStyle = {
    fontFamily: "var(--font-lato), Arial, Helvetica, sans-serif",
    fontSize: "16px",
    lineHeight: "1.4",
  };

  return (
    <footer className="w-full px-2 py-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex flex-row items-center justify-between gap-6">
          {/* Left: Copyright */}
          <div className="font-bold" style={textStyle}>
            © 2025 MAON INTELLIGENCE
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/our-story"
              className="font-bold hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              About
            </Link>
            <Link
              href="/how-it-works"
              className="font-bold hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              How it works
            </Link>
            <Link
              href="/waitlist"
              className="font-bold hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              Waitlist
            </Link>
          </div>

          {/* Right: Social Icons and Legal Links */}
          <div className="flex items-center gap-8">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:opacity-70 transition-opacity"
                aria-label="Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:opacity-70 transition-opacity"
                aria-label="X (Twitter)"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4l16 16M4 20L20 4" />
                </svg>
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="font-bold text-[#8C8C8C] hover:opacity-70 transition-opacity"
                style={textStyle}
              >
                Privacy
              </Link>
              <Link
                href="/tos"
                className="font-bold text-[#8C8C8C] hover:opacity-70 transition-opacity"
                style={textStyle}
              >
                Terms of Condition
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile: Vertical stacked layout */}
        <div className="flex flex-col items-center gap-4 md:hidden">
          {/* 1. Copyright */}
          <div className="font-bold" style={textStyle}>
            © 2025 MAON INTELLIGENCE
          </div>

          {/* 2. Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/our-story"
              className="font-bold hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              About
            </Link>
            <Link
              href="/how-it-works"
              className="font-bold hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              How it works
            </Link>
            <Link
              href="/waitlist"
              className="font-bold hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              Preorder
            </Link>
          </div>

          {/* 3. Social Media Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70 transition-opacity"
              aria-label="Instagram"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70 transition-opacity"
              aria-label="X (Twitter)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4l16 16M4 20L20 4" />
              </svg>
            </a>
          </div>

          {/* 4. Privacy & TOS */}
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="font-bold text-[#8C8C8C] hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              Privacy
            </Link>
            <Link
              href="/tos"
              className="font-bold text-[#8C8C8C] hover:opacity-70 transition-opacity"
              style={textStyle}
            >
              Terms of Condition
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

