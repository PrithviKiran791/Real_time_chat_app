"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Sparkles, MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    userId: Id<"users"> | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const UserProfileDialog = ({ userId, open, onOpenChange }: Props) => {
    const profile = useQuery(
        api.user.getUserProfile,
        userId ? { userId } : "skip"
    );

    const isLoading = profile === undefined;
    const name = profile?.displayName ?? profile?.username ?? "User Profile";
    const avatarUrl = profile?.customImageUrl ?? profile?.imageUrl ?? "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden">
                {/* Header background gradient */}
                <div className="relative h-20 bg-gradient-to-br from-primary/80 via-primary/50 to-primary/20">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-3">
                        <div className="size-16 animate-pulse rounded-full bg-muted mt-[-2rem] ring-4 ring-background" />
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-16 w-full animate-pulse rounded-lg bg-muted mt-4" />
                    </div>
                ) : !profile ? (
                    <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                        <User className="size-10 opacity-35" />
                        <p>User profile could not be found.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 pb-6">
                        {/* Avatar */}
                        <div className="px-5 flex items-end gap-3 -mt-8 relative">
                            <Avatar size="lg" className="size-16 ring-4 ring-background shadow-md">
                                <AvatarImage src={avatarUrl} alt={name} />
                                <AvatarFallback className="text-xl">
                                    <User className="size-6" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 mt-8">
                                <h2 className="truncate text-base font-semibold text-foreground">
                                    {name}
                                </h2>
                                <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
                            </div>
                        </div>

                        {/* Status Message */}
                        {profile.statusMessage && (
                            <div className="mx-5 p-3 rounded-lg bg-muted/40 border border-border/50 flex items-start gap-2">
                                <MessageSquareQuote className="size-4 shrink-0 text-primary/60 mt-0.5" />
                                <p className="text-xs text-foreground/80 italic leading-relaxed">
                                    &ldquo;{profile.statusMessage}&rdquo;
                                </p>
                            </div>
                        )}

                        {/* Details */}
                        <div className="px-5 flex flex-col gap-3">
                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Mail className="size-3.5 text-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </p>
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <div className="flex items-start gap-3 mt-1">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Sparkles className="size-3.5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            About
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mt-0.5">
                                            {profile.bio}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
