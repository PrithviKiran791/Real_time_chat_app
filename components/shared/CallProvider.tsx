"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Phone, PhoneOff, Video, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type ActiveCall = {
    conversationId: string;
    type: "audio" | "video";
    token: string;
};

type CallContextType = {
    activeCall: ActiveCall | null;
    isConnecting: boolean;
    startCall: (conversationId: string, type: "audio" | "video") => Promise<void>;
    joinCall: (conversationId: string) => Promise<void>;
    leaveCall: () => Promise<void>;
    declineCall: (conversationId: string) => void;
    incomingCall: { conversation: any; activeCall: any } | null;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

// Web Audio API Ringtone Generator
class RingtonePlayer {
    private audioCtx: AudioContext | null = null;
    private intervalId: any = null;

    start() {
        if (this.audioCtx) return;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
    const [declinedCallIds, setDeclinedCallIds] = useState<string[]>([]);
    const ringtonePlayerRef = useRef<RingtonePlayer | null>(null);

    const conversations = useQuery(api.conversations.list);
    const startCallMutation = useMutation(api.conversations.startCall);
    const joinCallMutation = useMutation(api.conversations.joinCall);
    const leaveCallMutation = useMutation(api.conversations.leaveCall);

    // Initialize ringtone player on client
    useEffect(() => {
        ringtonePlayerRef.current = new RingtonePlayer();
        return () => {
            ringtonePlayerRef.current?.stop();
        };
    }, []);

    // Detect if we have an incoming call
    const incomingCall = useMemo(() => {
        if (!conversations) return null;

        for (const conv of conversations) {
            if (conv.activeCall) {
                const isParticipant = conv.activeCall.participants.includes(conv.currentUserId);
                const isDeclined = declinedCallIds.includes(`${conv._id}-${conv.activeCall.startedAt}`);
                const isRecent = Date.now() - conv.activeCall.startedAt < 120000; // 2 minutes timeout

                // If user is a member of conversation but NOT currently in call, and has not declined
                if (!isParticipant && !isDeclined && isRecent) {
                    return { conversation: conv, activeCall: conv.activeCall };
                }
            }
        }
        return null;
    }, [conversations, declinedCallIds]);

    // Handle Ringtone playback based on incoming call state
    useEffect(() => {
        // If we are currently in an active call, don't ring for another incoming call
        if (incomingCall && !activeCall) {
            ringtonePlayerRef.current?.start();
        } else {
            ringtonePlayerRef.current?.stop();
        }
    }, [incomingCall, activeCall]);

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
            // 1. Update call state in database
            await startCallMutation({ conversationId: conversationId as any, type });

            // 2. Fetch LiveKit token
            const token = await fetchToken(conversationId);

            // 3. Set local active call
            setActiveCall({
                conversationId,
                type,
                token,
            });

            toast.success(`Starting ${type} call...`);
        } catch (error: any) {
            console.error("Failed to start call:", error);
            toast.error(error.message || "Failed to start call. Please try again.");
            // Reset DB state if we failed
            try {
                await leaveCallMutation({ conversationId: conversationId as any });
            } catch (e) {}
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
            const dbCall = await joinCallMutation({ conversationId: conversationId as any });

            // 2. Fetch LiveKit token
            const token = await fetchToken(conversationId);

            // 3. Set local active call
            setActiveCall({
                conversationId,
                type: dbCall.type as "audio" | "video",
                token,
            });

            // 4. Redirect to conversation if not there
            const targetPath = `/conversations/${conversationId}`;
            if (pathname !== targetPath) {
                router.push(targetPath);
            }

            toast.success("Joining call...");
        } catch (error: any) {
            console.error("Failed to join call:", error);
            toast.error(error.message || "Failed to join call. Please try again.");
        } finally {
            setIsConnecting(false);
        }
    };

    const leaveCall = async () => {
        if (!activeCall) return;

        const { conversationId } = activeCall;
        setActiveCall(null);
        setIsConnecting(false);

        try {
            await leaveCallMutation({ conversationId: conversationId as any });
            toast.success("Left call");
        } catch (error) {
            console.error("Failed to leave call on server:", error);
        }
    };

    const declineCall = (conversationId: string) => {
        if (!incomingCall) return;
        
        // Add to declined list so we don't prompt for this call again
        const key = `${conversationId}-${incomingCall.activeCall.startedAt}`;
        setDeclinedCallIds((prev) => [...prev, key]);
        toast.info("Call declined");
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
                    onDecline={() => declineCall(incomingCall.conversation._id)}
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
    incomingCall: { conversation: any; activeCall: any };
    onAccept: () => void;
    onDecline: () => void;
}) => {
    const { conversation, activeCall } = incomingCall;

    const initiator = useMemo(() => {
        return conversation.members.find((m: any) => m._id === activeCall.startedBy);
    }, [conversation, activeCall]);

    const title = conversation.isGroup
        ? conversation.name ?? "Group Call"
        : initiator?.username ?? "Direct Call";

    const subtitle = conversation.isGroup
        ? `${initiator?.username ?? "Someone"} is inviting you to a group ${activeCall.type} call`
        : `Incoming ${activeCall.type} call...`;

    const avatarUrl = conversation.isGroup
        ? conversation.imageUrl ?? ""
        : initiator?.imageUrl ?? "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all duration-300 hover:shadow-primary/5">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 flex items-center justify-center">
                        {/* Pulsing ring around avatar */}
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
                            className="flex items-center gap-2 px-6 py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            <PhoneOff className="size-4" />
                            Decline
                        </Button>
                        <Button
                            type="button"
                            onClick={onAccept}
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
