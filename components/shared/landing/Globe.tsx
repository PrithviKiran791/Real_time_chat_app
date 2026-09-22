"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  CHATSPHERE_CONNECTION_ARCS,
  CHATSPHERE_GLOBE_CONFIG,
} from "./globe-config";

const World = dynamic(
  () => import("@/components/ui/globe").then((m) => m.World),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse rounded-full bg-[#061A3A]/40"
        aria-hidden="true"
      />
    ),
  },
);

type HeroGlobeProps = {
  className?: string;
  variant?: "hero" | "compact";
};

/**
 * ChatSphere-specific wrapper around the Aceternity World globe.
 * Keeps vendor globe code in components/ui and product config here.
 */
const HeroGlobe = ({ className, variant = "hero" }: HeroGlobeProps) => {
  const config =
    variant === "compact"
      ? { ...CHATSPHERE_GLOBE_CONFIG, autoRotateSpeed: 0.35, pointSize: 3 }
      : CHATSPHERE_GLOBE_CONFIG;

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      aria-hidden="true"
    >
      <World data={CHATSPHERE_CONNECTION_ARCS} globeConfig={config} />
    </div>
  );
};

export default memo(HeroGlobe);
