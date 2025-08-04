import HeroSection from './components/HeroSection';
import ServiceIntro from './components/ServiceIntro';   // ← NEW

export default function App() {
  return (
    <>
      <HeroSection />
      <ServiceIntro />          {/* ← NEW just below hero */}
    </>
  );
}
