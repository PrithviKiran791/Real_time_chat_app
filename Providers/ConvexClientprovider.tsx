"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { AuthLoading, ConvexReactClient } from "convex/react";
import LoadingLogo from "@/components/shared/LoadingLogo";
import { clerkAppearance } from "@/components/auth/clerkAppearance";
import { AuthModalProvider } from "@/components/auth/AuthModalContext";
import AuthModal from "@/components/auth/AuthModal";

type Props = {
    children: React.ReactNode;
};

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


const ConvexClientProvider = ({ children }: Props) => {
    return (
        <ClerkProvider appearance={clerkAppearance}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <AuthLoading>
                    <LoadingLogo size={100} />
                </AuthLoading>
                <AuthModalProvider>
                    {children}
                    <AuthModal />
                </AuthModalProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};

export default ConvexClientProvider;
