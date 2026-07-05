"use client";

interface VideoMessageProps {
    fileUrl: string;
    fileName: string;
}

const VideoMessage = ({ fileUrl, fileName }: VideoMessageProps) => {
    return (
        <video
            src={fileUrl}
            controls
            preload="metadata"
            aria-label={fileName}
            className="max-w-[320px] w-full rounded-lg bg-black"
            style={{ maxHeight: "240px" }}
        >
            Your browser does not support the video tag.
        </video>
    );
};

export default VideoMessage;
