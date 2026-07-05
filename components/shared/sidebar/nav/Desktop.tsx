"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/theme/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";
import { useNavigation } from "@/convex/hooks/useNavigation";

const DesktopNav = () => {
    const paths = useNavigation();
    const { signOut } = useClerk();

    return (
        <Card className="hidden h-full w-20 shrink-0 flex-col items-center justify-between px-3 py-5 lg:flex">
            <nav>
                <ul className="flex flex-col items-center gap-3">
                    {paths.map((path) => (
                        <li key={path.href} className="relative">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        asChild
                                        size="icon-lg"
                                        variant={path.active ? "default" : "outline"}
                                    >
                                        <Link href={path.href} aria-label={path.name}>
                                            {path.icon}
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">{path.name}</TooltipContent>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex flex-col items-center gap-3">
                <ModeToggle />
                <UserButton />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Sign out"
                    onClick={() => signOut({ redirectUrl: "/" })}
                >
                    <LogOut className="size-5" />
                </Button>
            </div>
        </Card>
    );
};

export default DesktopNav;