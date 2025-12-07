"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
// import SmartSimpleBrilliant from "../app/_components/smart-simple-brilliant";
// import YourWorkInSync from "../app/_components/your-work-in-sync";
// import EffortlessIntegration from "../app/_components/effortless-integration-updated";
// import NumbersThatSpeak from "../app/_components/numbers-that-speak";
import DocumentationSection from "../app/_components/documentation-section";
// import TestimonialsSection from "../app/_components/testimonials-section";
import FAQSection from "../app/_components/faq-section";
import PricingSection from "../app/_components/pricing-section";
import CTASection from "../app/_components/cta-section";
import FooterSection from "../app/_components/footer-section";
// import SocialProofs from "./_components/social-proofs";
// import BentoGrid from "./_components/bento-grid";
import { Button } from "@/components/ui/button";
import Navigation from "./_components/Navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthDialogProvider, useAuthDialog } from "@/components/custom/AuthDialog";

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loadedFlags, setLoadedFlags] = useState<[boolean, boolean, boolean]>([false, false, false]);
  // Durations in ms: [add-focus, add-decision, timeline]
  const durations = useRef<[number, number, number]>([13000, 15000, 9000]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const { openSignup } = useAuthDialog();
  const { data: session } = useSession();

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgress(0);

    // Wait for the active GIF to load before starting timer
    if (!loadedFlags[activeCard]) return;

    const duration = durations.current[activeCard];
    const start = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setActiveCard((current) => (current + 1) % 3);
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeCard, loadedFlags]);

  const handleCardClick = (index: number) => {
    setActiveCard(index);
    setProgress(0);
  };


  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full overflow-x-hidden">
        {/* Main container with proper margins */}
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-7xl relative flex flex-col justify-start items-start min-h-screen overflow-x-hidden">
          {/* Left vertical line */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          {/* Right vertical line */}
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            {/* Navigation */}
            <Navigation />

            {/* Hero Section */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[28px] xs:text-[32px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
                    Your Single Point of Focus & Clarity.
                  </div>
                  <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] text-sm sm:text-base md:text-lg lg:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 font-medium">
                    Streamline your day with mindful journaling that connects focus, progress, and decisions
                    <br className="hidden sm:block" />
                    — all in one calm dashboard.
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-4">

                <div className="backdrop-blur-[8.25px] flex flex-col justify-start items-center gap-4 w-full sm:w-auto">
                  <Button
                    variant="heroDark"
                    size="hero"
                    className="font-medium leading-5 font-sans cursor-pointer w-full sm:w-auto"
                    onClick={() =>
                      session?.user
                        ? router.push("/dashboard")
                        : openSignup()
                    }
                  >
                    Explore Tools
                  </Button>
                  {!session?.user && (
                    <p className="text-xs text-[#605A57] text-center sm:text-left">
                      No credit card required
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full max-w-[960px] lg:w-[768px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
                <div className="w-full max-w-[960px] lg:w-[700px] h-[340px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start">

                  <div className="self-stretch flex-1 flex justify-start items-start">
                    {/* Main Content */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-full h-full overflow-hidden">
                        {/* Product Image 1 - Plan your schedules */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeCard === 0
                            ? "opacity-100 scale-100 blur-0"
                            : "opacity-0 scale-95 blur-sm"
                            }`}
                        >
                          <Image
                            src="/add-focus.gif"
                            alt="Daily focus and priority tracking dashboard showing customer subscription management interface"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 960px"
                            className="object-contain"
                            priority={activeCard === 0}
                            onLoadingComplete={() =>
                              setLoadedFlags((prev) => [true, prev[1], prev[2]])
                            }
                          />
                        </div>

                        {/* Product Image 2 - Data to insights */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeCard === 1
                            ? "opacity-100 scale-100 blur-0"
                            : "opacity-0 scale-95 blur-sm"
                            }`}
                        >
                          <Image
                            src="/add-decision.gif"
                            alt="Analytics dashboard with real-time insights, charts, graphs, and data visualization"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 960px"
                            className="object-contain"
                            priority={activeCard === 1}
                            onLoadingComplete={() =>
                              setLoadedFlags((prev) => [prev[0], true, prev[2]])
                            }
                          />
                        </div>

                        {/* Product Image 3 - Data visualization */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeCard === 2
                            ? "opacity-100 scale-100 blur-0"
                            : "opacity-0 scale-95 blur-sm"
                            }`}
                        >
                          <Image
                            src="/timeline.gif"
                            alt="Interactive data visualization dashboard with charts, metrics, and decision tracking"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 960px"
                            className="object-contain"
                            priority={activeCard === 2}
                            onLoadingComplete={() =>
                              setLoadedFlags((prev) => [prev[0], prev[1], true])
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch border-t border-[#E0DEDB] border-b border-[#E0DEDB] flex justify-center items-start overflow-hidden">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden hidden md:block">
                  {/* Left decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0 overflow-x-hidden">
                  {/* Feature Cards */}
                  <FeatureCard
                    title="Plan your focus with intention"
                    description="Define priorities, track progress, and stay aligned with what truly matters each day."
                    isActive={activeCard === 0}
                    progress={activeCard === 0 ? progress : 0}
                    onClick={() => handleCardClick(0)}
                  />
                  <FeatureCard
                    title="Record decisions with purpose"
                    description="Capture choices, reasons, and outcomes — reflect clearly before your next move."
                    isActive={activeCard === 1}
                    progress={activeCard === 1 ? progress : 0}
                    onClick={() => handleCardClick(1)}
                  />
                  <FeatureCard
                    title="Track timeline with clarity"
                    description="Visualize every day per week or month for both focus and decisions"
                    isActive={activeCard === 2}
                    progress={activeCard === 2 ? progress : 0}
                    onClick={() => handleCardClick(2)}
                  />
                </div>

                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden hidden md:block">
                  {/* Right decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Proof Section */}
              {/* <SocialProofs /> */}

              {/* Bento Grid Section */}
              {/* <BentoGrid /> */}

              {/* Documentation Section */}
              <DocumentationSection />

              {/* Testimonials Section */}
              {/* <TestimonialsSection /> */}

              {/* Pricing Section */}
              <PricingSection />

              {/* FAQ Section */}
              <FAQSection />

              {/* CTA Section */}
              <CTASection />

              {/* Footer Section */}
              <FooterSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FeatureCard component definition inline to fix import error
function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string;
  description: string;
  isActive: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <div
      className={`w-full md:flex-1 self-stretch px-4 md:px-6 py-4 md:py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 ${isActive
        ? "bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"
        : "border-l-0 border-r-0 md:border border-[#E0DEDB]/80"
        }`}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(50,45,43,0.08)]">
          <div
            className="h-full bg-[#322D2B] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="self-stretch flex justify-center flex-col text-[#49423D] text-sm md:text-sm font-semibold leading-5 md:leading-6 font-sans">
        {title}
      </div>
      <div className="self-stretch text-[#605A57] text-xs md:text-[13px] font-normal leading-[18px] md:leading-[22px] font-sans">
        {description}
      </div>
    </div>
  );
}
