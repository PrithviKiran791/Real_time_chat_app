"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MessageCircle, Sparkles, UserPlus } from "lucide-react";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

const ConversationFallback = () => {
    return ( 
        <Card className="relative hidden h-full w-full flex-col items-center justify-center gap-4 overflow-hidden border border-slate-200/80 bg-white/70 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#071A35]/50 dark:text-white lg:flex p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10 dark:border-[#2563EB]/40 dark:bg-[#0A2347]/80 dark:text-[#60A5FA] dark:shadow-[#2563EB]/20">
                <MessageCircle className="size-8" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-sm">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-600 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300 mb-1">
                    <Sparkles className="size-3.5" />
                    <span>Real-time Chat</span>
                </div>
                <h3 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white">Select a conversation</h3>
                <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
                    Choose an existing conversation from the sidebar or start a new direct message or group chat to begin.
                </p>
                <div className="mt-4">
                    <Link href="/friends">
                        <MovingBorderButton
                            borderRadius="0.875rem"
                            containerClassName="h-11 w-auto"
                            className="bg-white px-5 text-xs font-semibold text-slate-900 shadow-md transition-all hover:bg-slate-100 dark:bg-[#0A2347] dark:text-white dark:hover:bg-[#0E2E5C] border-blue-500/30 gap-2"
                            borderClassName="bg-[radial-gradient(#38bdf8_40%,transparent_60%)]"
                        >
                            <UserPlus className="size-4 text-[#0284c7] dark:text-[#38bdf8]" />
                            <span>Find Friends & Connect</span>
                        </MovingBorderButton>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default ConversationFallback;
