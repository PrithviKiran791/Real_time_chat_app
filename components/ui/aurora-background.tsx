"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "transition-bg relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#020617] text-white",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={
          {
            "--aurora":
              "repeating-linear-gradient(100deg,#0B2A5B_10%,#1D4ED8_15%,#0EA5E9_20%,#38BDF8_25%,#7DD3FC_30%,#1E40AF_35%)",
            "--dark-gradient":
              "repeating-linear-gradient(100deg,#020617_0%,#020617_7%,transparent_10%,transparent_12%,#020617_16%)",

            "--dark-blue": "#0B2A5B",
            "--blue-royal": "#1D4ED8",
            "--blue-primary": "#2563EB",
            "--sky-deep": "#0EA5E9",
            "--sky-bright": "#38BDF8",
            "--sky-soft": "#7DD3FC",
            "--black": "#020617",
            "--transparent": "transparent",
          } as React.CSSProperties
        }
      >
        {/* Mobile: zero-GPU static gradient */}
        <div className="md:hidden pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-[#020617] to-[#020617]" />

        {/* Desktop: Full dynamic animated Aurora */}
        <div
          className={cn(
            `hidden md:block after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--dark-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-55 blur-[12px] filter will-change-transform [--aurora:repeating-linear-gradient(100deg,#0B2A5B_10%,#1D4ED8_15%,#0EA5E9_20%,#38BDF8_25%,#7DD3FC_30%,#1E40AF_35%)] [--dark-gradient:repeating-linear-gradient(100deg,#020617_0%,#020617_7%,transparent_10%,transparent_12%,#020617_16%)] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] after:[background-size:200%,_100%] md:after:[background-attachment:fixed] after:mix-blend-difference after:content-[""]`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_20%,var(--transparent)_75%)]`
          )}
        />
      </div>
      {children}
    </div>
  );
};

export default AuroraBackground;
