"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SignIn, SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { clerkAppearance } from "./clerkAppearance";

interface AuthCardProps {
  mode?: "sign-in" | "sign-up";
  routing?: "hash" | "path";
  path?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  mode = "sign-in",
  routing = "hash",
  path,
}) => {
  return (
    <div className="flex w-full flex-col items-center">
      {/* Branding above the card */}
      <Link
        href="/"
        className="group mb-5 flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        aria-label="ChatSphere Home"
      >
        <span className="flex size-9 items-center justify-center rounded-xl border border-[#2563EB]/35 bg-[#2563EB]/20 shadow-md shadow-[#2563EB]/20">
          <MessageCircle className="size-5 text-[#60A5FA]" />
        </span>
        <span className="font-heading text-xl font-bold tracking-tight text-white">
          ChatSphere
        </span>
      </Link>

      {/* Dynamic Typewriter greeting */}
      <div className="mb-3 flex justify-center text-center">
        <TypewriterEffectSmooth
          words={
            mode === "sign-in"
              ? [
                  { text: "Welcome" },
                  { text: "back" },
                  { text: "to" },
                  { text: "ChatSphere.", className: "text-[#60A5FA]" },
                ]
              : [
                  { text: "Create" },
                  { text: "your" },
                  { text: "free" },
                  { text: "account.", className: "text-[#60A5FA]" },
                ]
          }
          className="my-0.5 justify-center"
          textClassName="text-sm sm:text-base font-semibold text-slate-200"
          cursorClassName="bg-[#60A5FA]"
        />
      </div>

      {/* Neomorphic elevated card container */}
      <div
        className="neomorphic-card neomorphic-animate-enter relative w-full max-w-[420px] mx-auto px-5 py-6 sm:px-7 sm:py-7"
        role="region"
        aria-label={mode === "sign-in" ? "ChatSphere Sign In" : "ChatSphere Sign Up"}
      >
        <ClerkLoading>
          <div className="flex min-h-[380px] flex-col items-center justify-center space-y-4">
            <div
              className="size-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent"
              role="status"
              aria-label="Loading authentication..."
            />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
              Connecting to ChatSphere...
            </span>
          </div>
        </ClerkLoading>

        <ClerkLoaded>
          <div className="neomorphic-clerk-wrapper w-full">
            {mode === "sign-in" ? (
              routing === "path" ? (
                <SignIn
                  routing="path"
                  path={path ?? "/sign-in"}
                  signUpUrl="/sign-up"
                  fallbackRedirectUrl="/conversations"
                  forceRedirectUrl="/conversations"
                  appearance={clerkAppearance}
                />
              ) : (
                <SignIn
                  routing="hash"
                  fallbackRedirectUrl="/conversations"
                  forceRedirectUrl="/conversations"
                  appearance={clerkAppearance}
                />
              )
            ) : routing === "path" ? (
              <SignUp
                routing="path"
                path={path ?? "/sign-up"}
                signInUrl="/sign-in"
                fallbackRedirectUrl="/conversations"
                forceRedirectUrl="/conversations"
                appearance={clerkAppearance}
              />
            ) : (
              <SignUp
                routing="hash"
                fallbackRedirectUrl="/conversations"
                forceRedirectUrl="/conversations"
                appearance={clerkAppearance}
              />
            )}
          </div>

          <div className="mt-5 flex w-full flex-col items-center border-t border-white/10 pt-4">
            <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"} className="w-full">
              <MovingBorderButton
                borderRadius="0.75rem"
                containerClassName="h-10 w-full"
                className="bg-[#071A35]/90 hover:bg-[#0A2347] text-xs font-semibold text-[#93C5FD] transition-colors border-blue-500/30"
                borderClassName="bg-[radial-gradient(#60A5FA_40%,transparent_60%)]"
              >
                {mode === "sign-in" ? "New to ChatSphere? Create Account" : "Already have an account? Sign In"}
              </MovingBorderButton>
            </Link>
          </div>
        </ClerkLoaded>
      </div>
    </div>
  );
};

export default AuthCard;
