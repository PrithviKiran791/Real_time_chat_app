"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import HeroGlobe from "./Globe";
import styles from "./landing.module.css";

const Hero = () => {
  return (
    <section
      id="home"
      className={`${styles.heroGrid} relative flex min-h-190 w-full items-center overflow-hidden bg-transparent pb-16 pt-28 sm:min-h-screen lg:pt-32`}
    >
      {/* Atmospheric depth */}
      <div
        className={`${styles.heroGlow} pointer-events-none absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563EB]/10 blur-[120px]`}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-[#0B2A5B]/40 blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-32 h-64 w-64 rounded-full bg-[#2563EB]/8 blur-[60px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
        {/* Left — copy & CTAs */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div
            className={`${styles.fadeInUp} mb-6 inline-flex items-center gap-2 rounded-full border border-[#2563EB]/35 bg-[#061A3A]/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#93C5FD]`}
            style={{ animationDelay: "0.02s" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA] shadow-[0_0_12px_#60A5FA]" />
            Live conversations, beautifully simple
          </div>
          <h1
            className={`${styles.fadeInUp} max-w-3xl text-balance font-heading text-5xl font-bold leading-[0.98] text-white sm:text-6xl lg:text-7xl`}
            style={{ animationDelay: "0.08s" }}
          >
            Connect Without Boundaries.
          </h1>

          <div className={`${styles.fadeInUp} my-2 flex justify-center lg:justify-start`} style={{ animationDelay: "0.12s" }}>
            <TypewriterEffectSmooth
              words={[
                { text: "Talk." },
                { text: "Share." },
                { text: "Connect." },
                { text: "In" },
                { text: "Real", className: "text-[#60A5FA]" },
                { text: "Time.", className: "text-[#60A5FA]" },
              ]}
              textClassName="text-lg sm:text-xl md:text-2xl font-semibold text-[#CBD5E1]"
              cursorClassName="bg-[#60A5FA]"
            />
          </div>

          <p
            className={`${styles.fadeInUp} mt-3 max-w-xl text-pretty text-base leading-relaxed text-[#94A3B8] sm:text-lg`}
            style={{ animationDelay: "0.18s" }}
          >
            Chat instantly, create groups, share files, and make audio or video
            calls — all from one platform built for seamless global
            communication.
          </p>

          <div
            className={`${styles.fadeInUp} mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start`}
            style={{ animationDelay: "0.26s" }}
          >
            <Show when="signed-out">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <MovingBorderButton
                  borderRadius="0.75rem"
                  containerClassName="h-12 w-full sm:w-auto"
                  className="bg-[#0B2A5B]/90 hover:bg-[#1D4ED8] text-white text-base font-semibold px-7 gap-2 border-blue-500/40 shadow-lg shadow-[#2563EB]/20 transition-all"
                  borderClassName="bg-[radial-gradient(#60A5FA_40%,transparent_60%)]"
                >
                  Get Started Free
                  <ArrowRight className="size-4" />
                </MovingBorderButton>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/conversations" className="w-full sm:w-auto">
                <MovingBorderButton
                  borderRadius="0.75rem"
                  containerClassName="h-12 w-full sm:w-auto"
                  className="bg-[#0B2A5B]/90 hover:bg-[#1D4ED8] text-white text-base font-semibold px-7 gap-2 border-blue-500/40 shadow-lg shadow-[#2563EB]/20 transition-all"
                  borderClassName="bg-[radial-gradient(#60A5FA_40%,transparent_60%)]"
                >
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </MovingBorderButton>
              </Link>
            </Show>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full gap-2 rounded-xl border-[#2563EB]/40 bg-transparent px-7 text-base text-[#CBD5E1] transition-all hover:border-[#60A5FA] hover:bg-[#061A3A] hover:text-white sm:w-auto"
            >
              <a href="#features">Explore Features</a>
            </Button>
          </div>

        </div>

        {/* Right — interactive globe */}
        <div
          className={`${styles.fadeIn} relative mx-auto w-full max-w-120 lg:max-w-none`}
          style={{ animationDelay: "0.2s" }}
        >
          <div className="relative mx-auto aspect-square w-full max-w-105 sm:max-w-120 lg:ml-auto lg:max-w-140">
            <div className="absolute inset-0 rounded-full bg-[#2563EB]/5 blur-3xl" />
            <div className="relative h-full w-full min-h-70 sm:min-h-90 lg:min-h-120">
              <HeroGlobe className="h-full w-full" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-[#64748B] lg:justify-end">
            <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA]" />
            A clearer way to stay close
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
