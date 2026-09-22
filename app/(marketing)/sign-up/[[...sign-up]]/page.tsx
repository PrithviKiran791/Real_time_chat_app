"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

export default function SignUpPage() {
  return (
    <AuroraBackground className="flex min-h-screen w-full flex-col items-center justify-between overflow-x-hidden bg-[#020617] px-4 py-6 sm:px-6 sm:py-8">
      {/* Top back navigation in flow */}
      <div className="z-20 flex w-full max-w-[420px] items-center justify-start">
        <Link href="/" className="inline-block">
          <MovingBorderButton
            borderRadius="0.75rem"
            containerClassName="h-10 w-auto"
            className="bg-[#071A35]/90 hover:bg-[#0A2347] text-xs font-semibold text-white px-4 gap-2 border-white/10 transition-all shadow-md shadow-black/30"
            borderClassName="bg-[radial-gradient(#60A5FA_40%,transparent_60%)]"
          >
            <ArrowLeft className="size-4 text-[#60A5FA]" />
            <span>Back to ChatSphere</span>
          </MovingBorderButton>
        </Link>
      </div>

      {/* Perfectly centered card section */}
      <div className="relative z-10 my-auto flex w-full max-w-[420px] flex-col items-center justify-center py-6">
        <AuthCard mode="sign-up" routing="path" path="/sign-up" />
      </div>

      {/* Subtle security footnote */}
      <p className="relative z-10 text-center text-xs text-[#64748B]">
        End-to-end encrypted messaging & real-time connectivity
      </p>
    </AuroraBackground>
  );
}
