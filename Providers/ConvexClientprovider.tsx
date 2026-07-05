"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { AuthLoading, ConvexReactClient } from "convex/react";
import LoadingLogo from "@/components/shared/LoadingLogo";

type Props = {
    children: React.ReactNode;
};

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


const ConvexClientProvider = ({ children }: Props) => {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <AuthLoading>
                    <LoadingLogo size={100} />
                </AuthLoading>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};

export default ConvexClientProvider;
