"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/theme/theme-toggle";
import { LogOut } from "lucide-react";
import { useConversation } from "../../../../convex/hooks/useConversation";
import { useNavigation } from "@/convex/hooks/useNavigation";

const MobileNav = () => {
    const paths = useNavigation();
    const { isActive } = useConversation();
    const { signOut } = useClerk();

    if (isActive) return null;

    return (
        <Card className="fixed bottom-3 left-3 right-3 z-50 h-16 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden border-slate-200/80 bg-white/95 dark:border-white/10 dark:bg-[#071A35]/95 shadow-xl">
            <nav className="flex h-full items-center justify-between gap-2">
                {paths.map((path) => (
                    <Button
                        key={path.href}
                        asChild
                        size="icon"
                        variant={path.active ? "default" : "outline"}
                    >
                        <Link href={path.href} aria-label={path.name}>
                            {path.icon}
                        </Link>
                    </Button>
                ))}
                <ModeToggle />
                <UserButton />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Sign out"
                    onClick={() => signOut({ redirectUrl: "/" })}
                >
                    <LogOut className="size-4" />
                </Button>
            </nav>
        </Card>
    );
};

export default MobileNav;