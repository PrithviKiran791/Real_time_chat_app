"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    useConnectionState,
    useLocalParticipant,
    useParticipants,
    useTracks,
    VideoTrack,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    Maximize2,
    Minimize2,
    Users,
    Loader2,
    Wifi,
    Volume2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CallUIProps {
    isVideo: boolean;
    onLeave: () => void;
}

const CallUI: React.FC<CallUIProps> = ({ isVideo, onLeave }) => {
    const connectionState = useConnectionState();
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();
    
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(!isVideo);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showParticipantsList, setShowParticipantsList] = useState(false);
    const [duration, setDuration] = useState(0);

    // Call duration timer
    useEffect(() => {
        if (connectionState !== ConnectionState.Connected) return;
        const timer = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [connectionState]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [
            h > 0 ? h : null,
            m.toString().padStart(2, "0"),
            s.toString().padStart(2, "0"),
        ]
            .filter((x) => x !== null)
            .join(":");
    };

    // Track references for video camera feeds
    const trackRefs = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    );

    // Synchronize media control states with local participant
    useEffect(() => {
        if (localParticipant) {
            setIsMuted(!localParticipant.isMicrophoneEnabled);
            setIsCamOff(!localParticipant.isCameraEnabled);
        }
    }, [localParticipant]);

    const toggleMic = async () => {
        if (!localParticipant) return;
        const newEnabled = !localParticipant.isMicrophoneEnabled;
        await localParticipant.setMicrophoneEnabled(newEnabled);
        setIsMuted(!newEnabled);
    };

    const toggleCam = async () => {
        if (!localParticipant) return;
        const newEnabled = !localParticipant.isCameraEnabled;
        await localParticipant.setCameraEnabled(newEnabled);
        setIsCamOff(!newEnabled);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            void document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                void document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Parse participant metadata (embedded by API route)
    const getParticipantInfo = (p: any) => {
        let imageUrl = "";
        let username = p.name || p.identity;
        try {
            if (p.metadata) {
                const meta = JSON.parse(p.metadata);
                imageUrl = meta.imageUrl || "";
                username = meta.username || username;
            }
        } catch (e) {}
        return { username, imageUrl };
    };

    // Connection states handling (Connecting/Reconnecting/Permissions Error)
    if (connectionState === ConnectionState.Connecting) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-300 p-8 h-full">
                <Loader2 className="size-10 animate-spin text-primary" />
                <h3 className="text-lg font-semibold text-white">Connecting to call room...</h3>
                <p className="text-sm text-zinc-400">Requesting media permissions and setting up connection.</p>
            </div>
        );
    }

    if (connectionState === ConnectionState.Reconnecting) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-300 p-8 h-full">
                <Loader2 className="size-10 animate-spin text-yellow-500" />
                <h3 className="text-lg font-semibold text-yellow-500">Connection lost</h3>
                <p className="text-sm text-zinc-400">Attempting to automatically reconnect...</p>
            </div>
        );
    }

    if (connectionState === ConnectionState.Disconnected) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-300 p-8 h-full">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <PhoneOff className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">Disconnected</h3>
                <p className="text-sm text-zinc-400">You have been disconnected from the call.</p>
                <Button type="button" onClick={onLeave} className="mt-2">Back to Chat</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col justify-between h-full bg-zinc-950 text-white relative">
            {/* Header Status Bar */}
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2.5">
                    <span className={cn(
                        "size-2.5 rounded-full animate-pulse",
                        isVideo ? "bg-red-500" : "bg-emerald-500"
                    )} />
                    <span className="text-sm font-semibold tracking-wide text-zinc-200">
                        {isVideo ? "Video Call" : "Audio Call"}
                    </span>
                    <span className="text-xs text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full font-mono">
                        {formatDuration(duration)}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowParticipantsList(!showParticipantsList)}
                        className="text-zinc-400 hover:text-white hover:bg-white/10 size-8"
                        aria-label="Participants"
                    >
                        <Users className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Main calling view (Audio avatars vs Video grid) */}
            <div className="flex-1 flex min-h-0 relative items-center justify-center p-6">
                {!isVideo || trackRefs.length === 0 ? (
                    /* Audio Call / Avatar Mode */
                    <div className="flex flex-wrap items-center justify-center gap-10 max-w-4xl">
                        {participants.map((p) => {
                            const { username, imageUrl } = getParticipantInfo(p);
                            const speaking = p.isSpeaking;

                            return (
                                <div key={p.identity} className="flex flex-col items-center gap-3">
                                    <div className="relative">
                                        <div className={cn(
                                            "absolute -inset-1 rounded-full bg-emerald-500/20 blur opacity-0 transition-opacity duration-300",
                                            speaking && "opacity-100 animate-pulse"
                                        )} />
                                        <Avatar className={cn(
                                            "size-24 border-2 border-zinc-700/80 transition-all duration-300",
                                            speaking && "border-emerald-500 scale-[1.03] ring-4 ring-emerald-500/20"
                                        )}>
                                            <AvatarImage src={imageUrl} alt={username} />
                                            <AvatarFallback className="bg-zinc-800 text-xl font-bold">
                                                {username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {!p.isMicrophoneEnabled && (
                                            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-red-500 text-white shadow-md border-2 border-zinc-950">
                                                <MicOff className="size-3.5" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                                        {username} {p.isLocal && <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.2 rounded">(You)</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Video Call Grid Mode */
                    <div className={cn(
                        "grid gap-4 w-full h-full max-w-6xl",
                        trackRefs.length === 1 && "grid-cols-1",
                        trackRefs.length === 2 && "grid-cols-1 md:grid-cols-2",
                        trackRefs.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    )}>
                        {trackRefs.map((trackRef) => {
                            const p = trackRef.participant;
                            const { username, imageUrl } = getParticipantInfo(p);
                            const speaking = p.isSpeaking;
                            const hasVideo = p.isCameraEnabled && trackRef.publication?.track;

                            return (
                                <div
                                    key={`${p.identity}-${trackRef.source}`}
                                    className={cn(
                                        "relative bg-zinc-900 rounded-2xl overflow-hidden aspect-video border transition-all duration-300",
                                        speaking ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-zinc-800"
                                    )}
                                >
                                    {hasVideo ? (
                                        <VideoTrack trackRef={trackRef as any} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 gap-4">
                                            <Avatar className="size-20 border-2 border-zinc-700 shadow-xl">
                                                <AvatarImage src={imageUrl} alt={username} />
                                                <AvatarFallback className="bg-zinc-800 text-xl font-bold">
                                                    {username.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-zinc-400">Camera Off</span>
                                        </div>
                                    )}
                                    {/* Participant Overlay Details */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium text-white max-w-[80%]">
                                        <span className="truncate">
                                            {username} {p.isLocal && "(You)"}
                                        </span>
                                        {!p.isMicrophoneEnabled && (
                                            <MicOff className="size-3.5 text-red-500 shrink-0" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Sidebar Participants List Overlay */}
                {showParticipantsList && (
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-zinc-900 border-l border-zinc-800 p-4 z-20 flex flex-col animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                            <h4 className="font-bold text-sm">Participants ({participants.length})</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowParticipantsList(false)}
                                className="text-zinc-500 hover:text-white h-7 px-2"
                            >
                                Close
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                            {participants.map((p) => {
                                const { username, imageUrl } = getParticipantInfo(p);
                                return (
                                    <div key={p.identity} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-950/40">
                                        <Avatar className="size-8">
                                            <AvatarImage src={imageUrl} alt={username} />
                                            <AvatarFallback className="bg-zinc-800 text-xs font-bold">
                                                {username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{username}</p>
                                            <p className="text-[10px] text-zinc-500">
                                                {p.isLocal ? "Host" : "Participant"}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {!p.isMicrophoneEnabled ? (
                                                <MicOff className="size-3.5 text-red-500" />
                                            ) : (
                                                <Mic className="size-3.5 text-zinc-400" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    {/* Mic Mute Toggle */}
                    <Button
                        type="button"
                        onClick={toggleMic}
                        variant={isMuted ? "destructive" : "secondary"}
                        size="icon"
                        className={cn(
                            "size-12 rounded-full hover:scale-105 active:scale-95 transition-all duration-200 shadow-md",
                            !isMuted && "bg-zinc-800 hover:bg-zinc-700 text-white"
                        )}
                        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                    >
                        {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                    </Button>

                    {/* Camera Toggle (Video Call Only) */}
                    <Button
                        type="button"
                        onClick={toggleCam}
                        variant={isCamOff ? "destructive" : "secondary"}
                        size="icon"
                        className={cn(
                            "size-12 rounded-full hover:scale-105 active:scale-95 transition-all duration-200 shadow-md",
                            !isCamOff && "bg-zinc-800 hover:bg-zinc-700 text-white",
                            !isVideo && "opacity-40 cursor-not-allowed hover:scale-100"
                        )}
                        disabled={!isVideo}
                        aria-label={isCamOff ? "Turn camera on" : "Turn camera off"}
                    >
                        {isCamOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
                    </Button>

                    {/* Fullscreen Toggle */}
                    <Button
                        type="button"
                        onClick={toggleFullscreen}
                        variant="secondary"
                        size="icon"
                        className="size-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
                        aria-label="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
                    </Button>

                    {/* Leave Call (Red circular hangup) */}
                    <Button
                        type="button"
                        onClick={onLeave}
                        variant="destructive"
                        size="icon"
                        className="size-12 rounded-full bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
                        aria-label="Hang up call"
                    >
                        <PhoneOff className="size-5 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CallUI;
