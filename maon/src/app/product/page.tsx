import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import HeroSection from "./components/HeroSection";
import Image from "next/image";
import Row1 from "./components/Row1";
import Row2 from "./components/Row2";
import Row3 from "./components/Row3";
import Links from "./components/Links";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#FCF8F4]">
      <Navigation />
      
      {/* Hero Section with Orbiting Items */}
      <HeroSection />
      <Row1 />
      <Row2 />
      <Row3 />
      <Links />
      <Footer />
    </div>
  );
}