"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Phone, PhoneOff, Video, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export type CallStatus = "idle" | "ringing" | "connecting" | "active" | "declined" | "ended" | "missed";

export type ConversationMember = {
    _id: string;
    username: string;
    imageUrl?: string;
    customImageUrl?: string;
    displayName?: string;
};

export type ConversationActiveCall = {
    type: "audio" | "video";
    startedAt: number;
    startedBy: string;
    participants: string[];
    status: "ringing" | "connecting" | "active" | "declined" | "ended" | "missed";
    declinedBy?: string[];
};

export type ConversationItem = {
    _id: string;
    isGroup?: boolean;
    name?: string;
    imageUrl?: string;
    currentUserId: string;
    members: ConversationMember[];
    activeCall?: ConversationActiveCall;
};

export type IncomingCallPayload = {
    conversation: ConversationItem;
    activeCall: ConversationActiveCall;
};

export type ActiveCall = {
    conversationId: string;
    type: "audio" | "video";
    token: string;
    status?: CallStatus;
};

type CallContextType = {
    activeCall: ActiveCall | null;
    isConnecting: boolean;
    startCall: (conversationId: string, type: "audio" | "video") => Promise<void>;
    joinCall: (conversationId: string) => Promise<void>;
    leaveCall: () => Promise<void>;
    declineCall: (conversationId: string) => Promise<void>;
    incomingCall: IncomingCallPayload | null;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

// Web Audio API Ringtone Generator
class RingtonePlayer {
    private audioCtx: AudioContext | null = null;
    private intervalId: ReturnType<typeof setInterval> | null = null;

    start() {
        if (this.audioCtx) return;

        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        try {
            this.audioCtx = new AudioContextClass();

            const playBeep = () => {
                if (!this.audioCtx || this.audioCtx.state === "suspended") return;

                const osc1 = this.audioCtx.createOscillator();
                const osc2 = this.audioCtx.createOscillator();
                const gainNode = this.audioCtx.createGain();

                osc1.type = "sine";
                osc1.frequency.value = 440; // Ringback frequency 1

                osc2.type = "sine";
                osc2.frequency.value = 480; // Ringback frequency 2

                gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime + 1.8);
                gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 2.0);

                osc1.connect(gainNode);
                osc2.connect(gainNode);
                gainNode.connect(this.audioCtx.destination);

                osc1.start();
                osc2.start();

                osc1.stop(this.audioCtx.currentTime + 2.0);
                osc2.stop(this.audioCtx.currentTime + 2.0);
            };

            playBeep();
            this.intervalId = setInterval(playBeep, 3000);
        } catch (error) {
            console.error("Failed to start ringtone player:", error);
        }
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.audioCtx) {
            void this.audioCtx.close();
            this.audioCtx = null;
        }
    }
}

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const ringtonePlayerRef = useRef<RingtonePlayer | null>(null);
    const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [now, setNow] = useState<number>(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const conversations = useQuery(api.conversations.list) as ConversationItem[] | undefined;
    const startCallMutation = useMutation(api.conversations.startCall);
    const joinCallMutation = useMutation(api.conversations.joinCall);
    const leaveCallMutation = useMutation(api.conversations.leaveCall);
    const declineCallMutation = useMutation(api.conversations.declineCall);
    const timeoutCallMutation = useMutation(api.conversations.timeoutCall);

    // Initialize ringtone player on client
    useEffect(() => {
        ringtonePlayerRef.current = new RingtonePlayer();
        return () => {
            ringtonePlayerRef.current?.stop();
        };
    }, []);

    // Detect if we have an incoming call for current user
    // Derived directly — React Compiler handles optimization automatically
    const findIncomingCall = (): IncomingCallPayload | null => {
        if (!conversations) return null;
        for (const conv of conversations) {
            if (conv.activeCall) {
                const isParticipant = conv.activeCall.participants.includes(conv.currentUserId);
                const isDeclined = (conv.activeCall.declinedBy ?? []).includes(conv.currentUserId);
                const isRecent = now - conv.activeCall.startedAt < 45000;
                if (!isParticipant && !isDeclined && isRecent) {
                    return { conversation: conv, activeCall: conv.activeCall };
                }
            }
        }
        return null;
    };
    const incomingCall = findIncomingCall();

    // Handle ringing sound for incoming calls
    useEffect(() => {
        if (incomingCall && !activeCall) {
            ringtonePlayerRef.current?.start();
        } else {
            ringtonePlayerRef.current?.stop();
        }
    }, [incomingCall, activeCall]);

    // Monitor caller's call status (e.g. If receiver declines or call terminates on server)
    useEffect(() => {
        if (!activeCall || !conversations) return;

        const currentConv = conversations.find((c) => c._id === activeCall.conversationId);
        if (!currentConv || !currentConv.activeCall) {
            // Call was ended or declined on server
            if (activeCall.status === "ringing") {
                toast.info("Call ended or declined");
                const timer = setTimeout(() => {
                    setActiveCall(null);
                    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
                }, 0);
                return () => clearTimeout(timer);
            }
        } else if (currentConv.activeCall.participants.length > 1 && activeCall.status === "ringing") {
            // Second participant joined - call is now ACTIVE!
            const timer2 = setTimeout(() => {
                setActiveCall((prev) => (prev ? { ...prev, status: "active" } : null));
                if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
                toast.success("Call connected");
            }, 0);
            return () => clearTimeout(timer2);
        }
    }, [conversations, activeCall]);

    // Handle browser unload when in active call
    useEffect(() => {
        const handleUnload = () => {
            if (activeCall) {
                void leaveCallMutation({ conversationId: activeCall.conversationId as Id<"conversations"> }).catch(() => {});
            }
        };
        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [activeCall, leaveCallMutation]);

    const fetchToken = async (conversationId: string): Promise<string> => {
        const res = await fetch(`/api/livekit?conversationId=${conversationId}`);
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Failed to generate LiveKit token");
        }
        const data = await res.json();
        return data.token;
    };

    const startCall = async (conversationId: string, type: "audio" | "video") => {
        if (activeCall) {
            toast.error("You are already in an active call.");
            return;
        }

        setIsConnecting(true);
        try {
            // 1. Update call state in database (status: "ringing")
            await startCallMutation({ conversationId: conversationId as Id<"conversations">, type });

            // 2. Fetch LiveKit token
            const token = await fetchToken(conversationId);

            // 3. Set local active call with ringing status
            setActiveCall({
                conversationId,
                type,
                token,
                status: "ringing",
            });

            // 4. Set 45-second unanswered timeout
            if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = setTimeout(async () => {
                try {
                    await timeoutCallMutation({ conversationId: conversationId as Id<"conversations"> });
                } catch {}
                setActiveCall(null);
                toast.info("No answer. Call timed out.");
            }, 45000);

            toast.success(`Calling... (${type} call)`);
        } catch (error) {
            console.error("Failed to start call:", error);
            toast.error(error instanceof Error ? error.message : "Failed to start call. Please try again.");
            try {
                await leaveCallMutation({ conversationId: conversationId as Id<"conversations"> });
            } catch {}
        } finally {
            setIsConnecting(false);
        }
    };

    const joinCall = async (conversationId: string) => {
        if (activeCall) {
            toast.error("You are already in an active call.");
            return;
        }

        setIsConnecting(true);
        try {
            // 1. Join call state in database
            const dbCall = await joinCallMutation({ conversationId: conversationId as Id<"conversations"> });

            // 2. Fetch LiveKit token
            const token = await fetchToken(conversationId);

            // 3. Set local active call as ACTIVE
            setActiveCall({
                conversationId,
                type: dbCall.type as "audio" | "video",
                token,
                status: "active",
            });

            // 4. Redirect to conversation if not there
            const targetPath = `/conversations/${conversationId}`;
            if (pathname !== targetPath) {
                router.push(targetPath);
            }

            toast.success("Connected to call");
        } catch (error) {
            console.error("Failed to join call:", error);
            toast.error(error instanceof Error ? error.message : "Failed to join call. Please try again.");
        } finally {
            setIsConnecting(false);
        }
    };

    const leaveCall = async () => {
        if (!activeCall) return;

        if (timeoutTimerRef.current) {
            clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
        }

        const { conversationId } = activeCall;
        setActiveCall(null);
        setIsConnecting(false);

        try {
            await leaveCallMutation({ conversationId: conversationId as Id<"conversations"> });
            toast.success("Call ended");
        } catch (error) {
            console.error("Failed to leave call on server:", error);
        }
    };

    const declineCall = async (conversationId: string) => {
        try {
            await declineCallMutation({ conversationId: conversationId as Id<"conversations"> });
            toast.info("Call declined");
        } catch (error) {
            console.error("Failed to decline call on server:", error);
        }
    };

    return (
        <CallContext.Provider
            value={{
                activeCall,
                isConnecting,
                startCall,
                joinCall,
                leaveCall,
                declineCall,
                incomingCall,
            }}
        >
            {children}
            {incomingCall && !activeCall && (
                <IncomingCallDialog
                    incomingCall={incomingCall}
                    onAccept={() => void joinCall(incomingCall.conversation._id)}
                    onDecline={() => void declineCall(incomingCall.conversation._id)}
                />
            )}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error("useCall must be used within a CallProvider");
    }
    return context;
};

// Incoming Call Dialog Component
const IncomingCallDialog = ({
    incomingCall,
    onAccept,
    onDecline,
}: {
    incomingCall: IncomingCallPayload;
    onAccept: () => void;
    onDecline: () => void;
}) => {
    const { conversation, activeCall } = incomingCall;

    const initiator = useMemo(() => {
        return conversation.members.find((m) => m._id === activeCall.startedBy);
    }, [conversation, activeCall]);

    const title = conversation.isGroup
        ? conversation.name ?? "Group Call"
        : initiator?.displayName || initiator?.username || "Direct Call";

    const subtitle = conversation.isGroup
        ? `${initiator?.displayName || initiator?.username || "Someone"} is inviting you to a group ${activeCall.type} call`
        : `Incoming ${activeCall.type} call...`;

    const avatarUrl = conversation.isGroup
        ? conversation.imageUrl ?? ""
        : initiator?.customImageUrl || initiator?.imageUrl || "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all duration-300 hover:shadow-primary/5">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 size-20 animate-ping rounded-full bg-primary/20 duration-1000" />
                        <Avatar className="size-20 border-2 border-primary shadow-lg">
                            <AvatarImage src={avatarUrl} alt={title} />
                            <AvatarFallback className="bg-primary/10 text-xl font-bold">
                                {title.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 px-2.5 py-1 rounded-full animate-pulse">
                        <Volume2 className="size-3.5" />
                        Ringing...
                    </div>

                    <div className="mt-6 flex w-full gap-3 justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onDecline}
                            aria-label="Decline incoming call"
                            className="flex items-center gap-2 px-6 py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            <PhoneOff className="size-4" />
                            Decline
                        </Button>
                        <Button
                            type="button"
                            onClick={onAccept}
                            aria-label="Accept incoming call"
                            className="flex items-center gap-2 px-6 py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            {activeCall.type === "video" ? <Video className="size-4" /> : <Phone className="size-4" />}
                            Accept
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
