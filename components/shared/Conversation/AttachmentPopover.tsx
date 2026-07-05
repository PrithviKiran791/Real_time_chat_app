"use client";

import { useRef, useState } from "react";
import { ImageIcon, FileText, Video, Paperclip, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUploadThing } from "@/lib/uploadthing";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface AttachmentPopoverProps {
    disabled?: boolean;
    conversationId: Id<"conversations">;
}

const AttachmentPopover = ({ disabled, conversationId }: AttachmentPopoverProps) => {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sendFileMessage = useMutation(api.conversations.sendFileMessage);

    const { startUpload: startImageUpload } = useUploadThing("imageUploader", {
        onUploadBegin: () => setUploading(true),
        onClientUploadComplete: async (res) => {
            const uploaded = res?.[0];
            if (!uploaded) return;
            try {
                await sendFileMessage({
                    conversationId,
                    type: "image",
                    fileUrl: uploaded.ufsUrl,
                    fileName: uploaded.name,
                    fileSize: uploaded.size,
                    mimeType: uploaded.type,
                });
            } catch {
                toast.error("Failed to send image.");
            } finally {
                setUploading(false);
                setOpen(false);
            }
        },
        onUploadError: (err) => {
            toast.error(err.message ?? "Image upload failed.");
            setUploading(false);
        },
    });

    const { startUpload: startVideoUpload } = useUploadThing("videoUploader", {
        onUploadBegin: () => setUploading(true),
        onClientUploadComplete: async (res) => {
            const uploaded = res?.[0];
            if (!uploaded) return;
            try {
                await sendFileMessage({
                    conversationId,
                    type: "video",
                    fileUrl: uploaded.ufsUrl,
                    fileName: uploaded.name,
                    fileSize: uploaded.size,
                    mimeType: uploaded.type,
                });
            } catch {
                toast.error("Failed to send video.");
            } finally {
                setUploading(false);
                setOpen(false);
            }
        },
        onUploadError: (err) => {
            toast.error(err.message ?? "Video upload failed.");
            setUploading(false);
        },
    });

    const { startUpload: startFileUpload } = useUploadThing("fileUploader", {
        onUploadBegin: () => setUploading(true),
        onClientUploadComplete: async (res) => {
            const uploaded = res?.[0];
            if (!uploaded) return;
            try {
                await sendFileMessage({
                    conversationId,
                    type: "file",
                    fileUrl: uploaded.ufsUrl,
                    fileName: uploaded.name,
                    fileSize: uploaded.size,
                    mimeType: uploaded.type,
                });
            } catch {
                toast.error("Failed to send file.");
            } finally {
                setUploading(false);
                setOpen(false);
            }
        },
        onUploadError: (err) => {
            toast.error(err.message ?? "File upload failed.");
            setUploading(false);
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            void startImageUpload(Array.from(files));
        }
        e.target.value = "";
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            void startVideoUpload(Array.from(files));
        }
        e.target.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            void startFileUpload(Array.from(files));
        }
        e.target.value = "";
    };

    const isDisabled = disabled || uploading;

    return (
        <>
            {/* Hidden file inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
            />
            <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={handleVideoChange}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                className="hidden"
                onChange={handleFileChange}
            />

            <Popover open={open} onOpenChange={setOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={isDisabled}
                                aria-label="Add attachment"
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                            >
                                {uploading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Paperclip className="size-4" />
                                )}
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {uploading ? "Uploading…" : "Attachment"}
                    </TooltipContent>
                </Tooltip>

                <PopoverContent
                    side="top"
                    align="start"
                    sideOffset={8}
                    className="w-52 p-1.5"
                >
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Attach
                    </p>
                    <div className="flex flex-col gap-0.5">
                        <button
                            type="button"
                            onClick={() => { imageInputRef.current?.click(); setOpen(false); }}
                            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Upload image"
                        >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                                <ImageIcon className="size-4" />
                            </span>
                            <div className="min-w-0 text-left">
                                <p className="font-medium leading-none">Image</p>
                                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">PNG, JPG, WEBP, GIF · 8MB</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { videoInputRef.current?.click(); setOpen(false); }}
                            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Upload video"
                        >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                                <Video className="size-4" />
                            </span>
                            <div className="min-w-0 text-left">
                                <p className="font-medium leading-none">Video</p>
                                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">MP4, MOV, WEBM · 64MB</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
                            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Upload file"
                        >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                                <FileText className="size-4" />
                            </span>
                            <div className="min-w-0 text-left">
                                <p className="font-medium leading-none">File</p>
                                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">PDF, DOC, ZIP, XLS · 16MB</p>
                            </div>
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
};

export default AttachmentPopover;
