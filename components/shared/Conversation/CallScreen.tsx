"use client";

import React from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import CallUI from "./CallUI";

interface CallScreenProps {
    token: string;
    video: boolean;
    onLeave: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ token, video, onLeave }) => {
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";

    // Auto-leave call when component unmounts (e.g., navigating away from the chat page)
    React.useEffect(() => {
        return () => {
            onLeave();
        };
    }, [onLeave]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950 text-white rounded-lg relative" data-lk-theme="default">
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                audio={true}
                video={video}
                onDisconnected={onLeave}
                className="flex flex-1 flex-col h-full w-full"
            >
                <CallUI isVideo={video} onLeave={onLeave} />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
};

export default CallScreen;
