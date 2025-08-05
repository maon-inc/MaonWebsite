import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Libre_Bodoni } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
});

const libreBodoni = Libre_Bodoni({
  variable: "--font-libre-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Maon",
  description: "Haptic Wearables for Emotion Regulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async defer src="https://tools.luckyorange.com/core/lo.js?site-id=bdf74af5"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${libreBodoni.variable} antialiased`} suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
