"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import DesktopNav from "./nav/Desktop";
import MobileNav from "./nav/mobileNav";
import Grainient from "@/components/ui/Grainient";

type Props = {
    children: React.ReactNode;
};

const emptySubscribe = () => () => {};

const SidebarWrapper = ({children}: Props) => {
    const { resolvedTheme } = useTheme();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    // Seamlessly transition animation between white theme and dark blue theme
    const isLight = mounted && resolvedTheme === "light";

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
            {/* Grainient animated WebGL background */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
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

            <div className="relative z-10 flex h-full w-full flex-col overflow-hidden lg:flex-row">
                <DesktopNav />
                <MobileNav />
                <main className="flex h-[calc(100vh-4rem)] w-full flex-1 flex-col items-stretch justify-start gap-4 overflow-y-auto px-4 py-4 lg:h-full lg:px-6 lg:py-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SidebarWrapper;