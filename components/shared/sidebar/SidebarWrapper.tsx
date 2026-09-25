"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import DesktopNav from "./nav/Desktop";
import MobileNav from "./nav/mobileNav";
import Grainient from "@/components/ui/Grainient";
import { useConversation } from "@/convex/hooks/useConversation";
import { cn } from "@/lib/utils";

type Props = {
    children: React.ReactNode;
};

const emptySubscribe = () => () => {};

const SidebarWrapper = ({children}: Props) => {
    const { resolvedTheme } = useTheme();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const { isActive } = useConversation();

    // Seamlessly transition animation between white theme and dark blue theme
    const isLight = mounted && resolvedTheme === "light";

    return (
        <div className="relative h-dvh w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
            {/* Grainient animated WebGL background: desktop only for 60fps buttery mobile performance */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden hidden md:block">
                <Grainient
                    color1={isLight ? "#FFFFFF" : "#071A35"}
                    color2={isLight ? "#F1F5F9" : "#1D4ED8"}
                    color3={isLight ? "#BAE6FD" : "#38BDF8"}
                    lightMode={isLight}
                    timeSpeed={isLight ? 0.18 : 0.22}
                    colorBalance={0}
                    warpStrength={1}
                    warpFrequency={5}
                    warpSpeed={1.8}
                    warpAmplitude={45}
                    blendAngle={0}
                    blendSoftness={0.06}
                    rotationAmount={450}
                    noiseScale={2}
                    grainAmount={isLight ? 0.05 : 0.08}
                    grainScale={2}
                    grainAnimated={false}
                    contrast={isLight ? 1.1 : 1.4}
                    gamma={1}
                    saturation={isLight ? 0.9 : 1.1}
                    centerX={0}
                    centerY={0}
                    zoom={0.9}
                    className="h-full w-full opacity-90"
                />
            </div>

            {/* Mobile optimized subtle CSS background (0% GPU overhead, butter-smooth 120Hz) */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:hidden bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-[#020617] dark:via-[#071A35]/30 dark:to-[#020617]" />

            <div className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row">
                <DesktopNav />
                <MobileNav />
                <main className={cn(
                    "flex min-h-0 w-full flex-1 flex-col items-stretch justify-start overflow-hidden",
                    isActive
                        ? "p-0 lg:p-6"
                        : "px-3 pt-3 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:p-6 lg:pb-6"
                )}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SidebarWrapper;