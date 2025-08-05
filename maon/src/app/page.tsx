import { Navigation, HeroSection, ServiceSection, UniqueSection, Footer, DataPreviewSection } from "./components";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ebe6df]">
      <Navigation />
      <main className="flex flex-col">
        <HeroSection />
        <ServiceSection />
        <UniqueSection />
        <DataPreviewSection />
      </main>
      <Footer />
    </div>
  );
}