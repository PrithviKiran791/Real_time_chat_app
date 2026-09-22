import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import WhyChooseUs from "./WhyChooseUs";
import GlobalConnectivity from "./GlobalConnectivity";
import Footer from "./Footer";

/**
 * Marketing landing page for signed-out visitors.
 * Sections are intentionally split into standalone components so new ones
 * can be dropped in here without touching existing sections.
 */
const LandingPage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#020617] text-white">
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <WhyChooseUs />
        <GlobalConnectivity />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
