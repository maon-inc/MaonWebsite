import type { Metadata } from "next";
import { Lato, Merriweather } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maon: AI Ring",
  description: "Maon is an AI-powered ring built to make you balanced without the effort. Restore your nervous system and reduce stress naturally.",
  keywords: ["AI ring", "nervous system", "stress relief", "wearable", "wellness", "balance"],
  openGraph: {
    title: "Maon - AI Ring to Superpower Your Nervous System",
    description: "Maon is an AI-powered ring built to make you balanced without the effort.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maon - AI Ring to Superpower Your Nervous System",
    description: "Maon is an AI-powered ring built to make you balanced without the effort.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${merriweather.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
