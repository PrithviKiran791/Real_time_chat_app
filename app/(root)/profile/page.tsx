"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/shared/profile/EditProfileDialog";
import {
    User,
    Pencil,
    Mail,
    Calendar,
    MessageSquareQuote,
    BadgeCheck,
    Sparkles,
} from "lucide-react";

const formatMemberSince = (creationTime: number) => {
    return new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
    }).format(new Date(creationTime));
};

export default function ProfilePage() {
    const me = useQuery(api.user.getMe);
    const [editOpen, setEditOpen] = useState(false);

    // Loading state
    if (me === undefined) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                <div className="size-24 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-56 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-32 w-full max-w-lg animate-pulse rounded-xl bg-muted" />
            </div>
        );
    }

    // Should never be null on this protected page — just safety
    if (!me) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <User className="size-10 opacity-30" />
                <p className="font-medium text-foreground">Profile unavailable</p>
                <p>Please refresh the page or sign in again.</p>
            </div>
        );
    }

    const displayName = me.displayName ?? me.username;
    const avatarUrl = me.customImageUrl ?? me.imageUrl;

    return (
        <div className="flex h-full flex-col overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl flex flex-col gap-5 p-4 pb-20 md:p-6">

                {/* ── Hero Card ── */}
                <Card className="relative overflow-hidden p-0">
                    {/* Gradient banner */}
                    <div className="h-32 bg-gradient-to-br from-primary via-primary/70 to-primary/40 relative">
                        <div className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                                backgroundSize: "40px 40px",
                            }}
                        />
                    </div>

                    {/* Avatar + name section */}
                    <div className="px-5 pb-5">
                        {/* Avatar overlapping banner */}
                        <div className="relative -mt-12 mb-3 flex items-end justify-between">
                            <Avatar
                                className="size-24 ring-4 ring-background shadow-xl"
                                size="lg"
                            >
                                <AvatarImage src={avatarUrl} alt={displayName} />
                                <AvatarFallback className="text-2xl bg-primary/10">
                                    <User className="size-10 text-primary/60" />
                                </AvatarFallback>
                            </Avatar>

                            <Button
                                id="open-edit-profile-btn"
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex gap-1.5 self-end"
                                onClick={() => setEditOpen(true)}
                            >
                                <Pencil className="size-3.5" />
                                Edit Profile
                            </Button>
                        </div>

                        {/* Name & meta */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
                                {me.displayName && (
                                    <BadgeCheck className="size-4 text-primary" aria-label="Custom display name set" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">@{me.username}</p>

                            {/* Status message */}
                            {me.statusMessage && (
                                <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground/80">
                                    <MessageSquareQuote className="size-3.5 shrink-0 text-primary/60" />
                                    <span className="italic">&ldquo;{me.statusMessage}&rdquo;</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ── About ── */}
                {me.bio ? (
                    <Card className="flex flex-col gap-3 p-5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">About</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {me.bio}
                        </p>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center gap-2 p-5 border-dashed opacity-60">
                        <Sparkles className="size-5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No bio yet</p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setEditOpen(true)}
                        >
                            Add a bio
                        </Button>
                    </Card>
                )}

                {/* ── Account Info ── */}
                <Card className="flex flex-col gap-4 p-5">
                    <h2 className="text-sm font-semibold">Account Information</h2>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Mail className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-xs text-muted-foreground">Email address</p>
                                <p className="text-sm font-medium truncate">{me.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <User className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs text-muted-foreground">Username (from account)</p>
                                <p className="text-sm font-medium">{me.username}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Calendar className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs text-muted-foreground">Member since</p>
                                <p className="text-sm font-medium">{formatMemberSince(me._creationTime)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Quick actions ── */}
                <Card className="flex flex-col gap-3 p-5">
                    <h2 className="text-sm font-semibold">Profile Settings</h2>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            id="edit-profile-settings-btn"
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditOpen(true)}
                        >
                            <Pencil className="size-3.5" />
                            Edit Display Name &amp; Bio
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        To change your email, password, or connected accounts, manage your account through the account button in the sidebar.
                    </p>
                </Card>
            </div>

            {/* Edit dialog */}
            {me && (
                <EditProfileDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    user={me}
                />
            )}
        </div>
    );
}
