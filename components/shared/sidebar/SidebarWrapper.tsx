import React from "react";
import DesktopNav from "./nav/Desktop";
import MobileNav from "./nav/mobileNav";
type Props = {
    children: React.ReactNode;
};

const SidebarWrapper = ({children}: Props) => {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden lg:flex-row">
            <DesktopNav />
            <MobileNav />
            <main className="flex h-[calc(100vh-4rem)] w-full flex-1 flex-col items-stretch justify-start gap-4 overflow-y-auto px-4 py-4 lg:h-full lg:px-6 lg:py-6">
                {children}
            </main>
        </div>
    );
};

export default SidebarWrapper;