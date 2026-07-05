"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImageMessageProps {
    fileUrl: string;
    fileName: string;
}

const ImageMessage = ({ fileUrl, fileName }: ImageMessageProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className="group relative block overflow-hidden rounded-lg"
                onClick={() => setLightboxOpen(true)}
                aria-label={`View image: ${fileName}`}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={fileUrl}
                    alt={fileName}
                    loading="lazy"
                    className="max-w-[260px] max-h-[200px] w-full object-cover rounded-lg transition-opacity group-hover:opacity-90"
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="size-6 text-white drop-shadow-lg" />
                </span>
            </button>

            {lightboxOpen ? (
                <dialog
                    open
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 w-full h-full max-w-none max-h-none m-0 p-0 border-0"
                    onClick={() => setLightboxOpen(false)}
                    aria-label="Image preview"
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain shadow-2xl"
                        />
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            className="absolute -top-3 -right-3 flex size-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                            aria-label="Close preview"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </dialog>
            ) : null}
        </>
    );
};

export default ImageMessage;
