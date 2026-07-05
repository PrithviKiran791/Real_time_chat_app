"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Globe from "./Globe";
import Clouds from "./Clouds";
import styles from "./landing.module.css";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white pt-24"
    >
      <Clouds />

      {/* Globe centerpiece, positioned behind content */}
      <div className="absolute left-1/2 top-1/2 -z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-80 sm:h-[720px] sm:w-[720px]">
        <Globe size={720} />
      </div>

      {/* soft ambient blur accents */}
      <div
        className="absolute -left-24 top-1/3 -z-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 bottom-1/4 -z-0 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <span
          className={`${styles.fadeInUp} mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-medium text-[#0F172A]`}
        >
          <span className="size-1.5 rounded-full bg-[#38BDF8]" />
          Real-time communication, reimagined
        </span>

        <h1
          className={`${styles.fadeInUp} text-balance font-heading text-4xl font-bold leading-tight text-[#0F172A] sm:text-5xl md:text-6xl`}
          style={{ animationDelay: "0.05s" }}
        >
          Connect Without Boundaries.
        </h1>

        <p
          className={`${styles.fadeInUp} mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-gray-600 sm:text-lg`}
          style={{ animationDelay: "0.15s" }}
        >
          Chat instantly, create groups, share files, and make audio or
          video calls — all in one place. Stay connected with anyone,
          anywhere in the world.
        </p>

        <div
          className={`${styles.fadeInUp} mt-9 flex flex-col items-center gap-3 sm:flex-row`}
          style={{ animationDelay: "0.25s" }}
        >
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="h-12 gap-2 rounded-xl bg-[#0F172A] px-7 text-base text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-[#1e2a4a]"
              >
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 rounded-xl bg-[#0F172A] px-7 text-base text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-[#1e2a4a]"
            >
              <Link href="/conversations">
                Go to Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Show>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 gap-2 rounded-xl border-[#38BDF8] bg-transparent px-7 text-base text-[#38BDF8] transition-all hover:bg-[#38BDF8] hover:text-white"
          >
            <a href="#how-it-works">
              <PlayCircle className="size-4" />
              See How It Works
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
