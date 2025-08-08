import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import HeroSection from "./components/HeroSection";
import Image from "next/image";
import Row1 from "./components/Row1";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#FCF8F4]">
      <Navigation />
      
      {/* Hero Section with Orbiting Items */}
      <HeroSection />
      <Row1 />

      <Footer />
    </div>
  );
}