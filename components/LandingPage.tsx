"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

// Import components for each section
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/hero-section";
import TrustedBySection from "@/components/sections/trusted-by-section";
import FeaturesSection from "@/components/sections/features-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import WeatherAlertsSection from "@/components/sections/weather-alerts-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import CtaSection from "@/components/sections/cta-section";
import Footer from "@/components/footer";

export default function LandingPage() {
  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = useTranslations("landingPage");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isScrolled={isScrolled} />

      <main className="flex-1">
        {/* All sections as components */}
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <WeatherAlertsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
