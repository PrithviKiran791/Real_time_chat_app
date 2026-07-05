"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import LoadingLogo from "@/components/shared/LoadingLogo";
import LandingPage from "@/components/shared/landing/LandingPage";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/conversations");
    }
  }, [isLoaded, isSignedIn, router]);

  // Avoid flashing the landing page for a user who is about to be
  // redirected to their dashboard.
  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <LoadingLogo size={100} />
      </div>
    );
  }

  return <LandingPage />;
}
