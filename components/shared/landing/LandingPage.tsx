import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import WhyChooseUs from "./WhyChooseUs";
import GlobalConnectivity from "./GlobalConnectivity";
import Stats from "./Stats";
import Testimonials from "./Testimonials";
import Footer from "./Footer";

/**
 * Marketing landing page for signed-out visitors.
 * Sections are intentionally split into standalone components so new ones
 * (Pricing, FAQ, Blog, API Docs, Integrations, Customer Stories, etc.) can
 * be dropped in here without touching existing sections.
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <WhyChooseUs />
        <GlobalConnectivity />
        <Stats />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
