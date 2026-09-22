"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useAuthModal } from "./AuthModalContext";
import AuthCard from "./AuthCard";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const AuthModal: React.FC = () => {
  const { isOpen, mode, closeModal } = useAuthModal();

  // Handle ESC key to dismiss modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("keydown", handleKeyDown);
    // Prevent document scrolling when modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication modal"
    >
      <AuroraBackground
        className="min-h-screen w-full px-4 py-8 sm:px-6"
        onClick={(e) => {
          // Dismiss if clicking directly on the backdrop container
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        {/* Centered card content wrapper */}
        <div className="relative z-10 my-auto flex w-full max-w-[440px] flex-col items-center">
          {/* Floating close button */}
          <button
            type="button"
            onClick={closeModal}
            className="absolute -top-3 -right-2 sm:-right-4 z-20 flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#071A35] text-[#94A3B8] shadow-md shadow-black/40 transition-all hover:-translate-y-0.5 hover:bg-[#0A2347] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
            aria-label="Close authentication modal"
          >
            <X className="size-4.5" />
          </button>

          <AuthCard mode={mode} routing="hash" />
        </div>
      </AuroraBackground>
    </div>
  );
};

export default AuthModal;
