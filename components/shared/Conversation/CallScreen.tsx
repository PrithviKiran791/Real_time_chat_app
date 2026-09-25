"use client";

import React, { useEffect, useRef } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { toast } from "sonner";
import CallUI from "./CallUI";
import { mapLiveKitConnectionError } from "@/components/shared/CallProvider";

interface CallScreenProps {
    token: string;
    video: boolean;
    onLeave: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ token, video, onLeave }) => {
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
    const onLeaveRef = useRef(onLeave);
    const leftRef = useRef(false);

    useEffect(() => {
        onLeaveRef.current = onLeave;
    }, [onLeave]);

    const handleLeave = () => {
        if (leftRef.current) return;
        leftRef.current = true;
        onLeaveRef.current();
    };

    useEffect(() => {
        leftRef.current = false;
        return () => {
            if (leftRef.current) return;
            leftRef.current = true;
            onLeaveRef.current();
        };
    }, [token]);

    if (!serverUrl) {
        return (
            <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-zinc-950 p-6 text-center text-white">
                <p className="text-sm text-zinc-300">Calling is temporarily unavailable. Please try again later.</p>
                <button
                    type="button"
                    className="rounded-lg bg-zinc-800 px-4 py-2 text-sm"
                    onClick={handleLeave}
                >
                    Back to chat
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-zinc-950 text-white lg:rounded-lg" data-lk-theme="default">
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                audio={true}
                video={video}
                onDisconnected={handleLeave}
                onError={(error) => {
                    toast.error(mapLiveKitConnectionError(error, video));
                    handleLeave();
                }}
                onMediaDeviceFailure={(_failure, kind) => {
                    const isCamera = kind === "videoinput" || (kind !== "audioinput" && video);
                    toast.error(
                        isCamera
                            ? "Camera access was blocked. Please allow camera access and try again."
                            : "Microphone access was blocked. Please allow microphone access and try again."
                    );
                }}
                className="flex h-full min-h-0 w-full flex-1 flex-col"
            >
                <CallUI isVideo={video} onLeave={handleLeave} />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
};

export default CallScreen;
