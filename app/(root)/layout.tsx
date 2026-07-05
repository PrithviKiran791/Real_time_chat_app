import SidebarWrapper from "@/components/shared/sidebar/SidebarWrapper";
import { StoreUserEffect } from "@/components/shared/StoreUserEffect";
import { CallProvider } from "@/components/shared/CallProvider";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

const Layout = ({children}: Props) => {
    return (
        <CallProvider>
            <StoreUserEffect />
            <SidebarWrapper>{children}</SidebarWrapper>
        </CallProvider>
    );
};

export default Layout;