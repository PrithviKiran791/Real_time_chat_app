"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useUploadThing } from "@/lib/uploadthing";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2, User, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: Doc<"users">;
};

const MAX_BIO = 200;
const MAX_STATUS = 80;
const MAX_DISPLAY_NAME = 50;

export const EditProfileDialog = ({ open, onOpenChange, user }: Props) => {
    const updateProfile = useMutation(api.user.updateProfile);

    // Form state — initialized from current user data
    const [displayName, setDisplayName] = useState(user.displayName ?? "");
    const [bio, setBio] = useState(user.bio ?? "");
    const [statusMessage, setStatusMessage] = useState(user.statusMessage ?? "");
    const [customImageUrl, setCustomImageUrl] = useState(user.customImageUrl ?? "");
    const [imagePreview, setImagePreview] = useState<string>(
        user.customImageUrl ?? user.imageUrl
    );
    const [uploadError, setUploadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload, isUploading } = useUploadThing("profileImageUploader", {
        onUploadError: (err) => {
            setUploadError(err.message ?? "Image upload failed");
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError("");

        // Preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        const results = await startUpload([file]);
        if (results?.[0]?.url) {
            setCustomImageUrl(results[0].url);
        }
    };

    const handleRemoveCustomImage = () => {
        setCustomImageUrl("");
        setImagePreview(user.imageUrl); // revert to Clerk avatar
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = async () => {
        if (saving || isUploading) return;

        setSaving(true);
        setSaved(false);

        try {
            await updateProfile({
                displayName: displayName.trim() || undefined,
                bio: bio.trim() || undefined,
                statusMessage: statusMessage.trim() || undefined,
                customImageUrl: customImageUrl || undefined,
            });
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onOpenChange(false);
            }, 800);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save profile";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const busy = saving || isUploading;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] gap-0 p-0 overflow-hidden">
                {/* Gradient header */}
                <div className="relative h-24 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/30">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                </div>

                {/* Avatar upload — overlaps the gradient */}
                <div className="relative -mt-12 px-5 pb-4 flex items-end gap-4">
                    <div className="relative shrink-0">
                        <Avatar
                            size="lg"
                            className="size-20 ring-4 ring-background shadow-lg cursor-pointer"
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                            <AvatarImage src={imagePreview} alt="Profile picture" />
                            <AvatarFallback className="text-xl">
                                <User className="size-8" />
                            </AvatarFallback>
                        </Avatar>

                        {/* Upload overlay button */}
                        <button
                            type="button"
                            aria-label="Upload profile picture"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full",
                                "bg-primary text-primary-foreground shadow-md ring-2 ring-background",
                                "transition-transform hover:scale-110 active:scale-95 disabled:opacity-60"
                            )}
                        >
                            {isUploading ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Camera className="size-3.5" />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => void handleFileChange(e)}
                        />
                    </div>

                    <div className="flex-1 min-w-0 mt-12">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {displayName || user.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    {/* Remove custom image button */}
                    {customImageUrl && (
                        <button
                            type="button"
                            aria-label="Remove custom profile picture"
                            onClick={handleRemoveCustomImage}
                            className="mt-12 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <X className="size-3" />
                            Remove
                        </button>
                    )}
                </div>

                {uploadError && (
                    <p className="mx-5 -mt-2 mb-2 text-xs text-destructive">{uploadError}</p>
                )}

                <DialogHeader className="px-5 pb-1">
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Customize how you appear to others in the app.
                    </DialogDescription>
                </DialogHeader>

                {/* Form fields */}
                <div className="flex flex-col gap-4 px-5 py-4">
                    {/* Display Name */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="edit-display-name" className="text-xs font-medium text-foreground">
                            Display Name
                        </label>
                        <Input
                            id="edit-display-name"
                            placeholder={user.username}
                            value={displayName}
                            maxLength={MAX_DISPLAY_NAME}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={busy}
                        />
                        <p className="text-xs text-muted-foreground">
                            {displayName.length}/{MAX_DISPLAY_NAME} · Leave blank to use your account name
                        </p>
                    </div>

                    {/* Status Message */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="edit-status" className="text-xs font-medium text-foreground">
                            Status
                        </label>
                        <Input
                            id="edit-status"
                            placeholder="What's on your mind?"
                            value={statusMessage}
                            maxLength={MAX_STATUS}
                            onChange={(e) => setStatusMessage(e.target.value)}
                            disabled={busy}
                        />
                        <p className="text-xs text-muted-foreground">
                            {statusMessage.length}/{MAX_STATUS}
                        </p>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="edit-bio" className="text-xs font-medium text-foreground">
                            Bio
                        </label>
                        <textarea
                            id="edit-bio"
                            placeholder="Tell people a little about yourself..."
                            value={bio}
                            maxLength={MAX_BIO}
                            rows={3}
                            disabled={busy}
                            onChange={(e) => setBio(e.target.value)}
                            className={cn(
                                "w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm",
                                "transition-colors outline-none placeholder:text-muted-foreground",
                                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                                "disabled:pointer-events-none disabled:opacity-50",
                                "dark:bg-input/30"
                            )}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {bio.length}/{MAX_BIO}
                        </p>
                    </div>
                </div>

                <DialogFooter className="px-5 py-4 border-t bg-muted/30">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        id="save-profile-btn"
                        type="button"
                        disabled={busy}
                        onClick={() => void handleSave()}
                        className={cn(
                            "min-w-[90px] transition-all",
                            saved && "bg-emerald-500 hover:bg-emerald-500 border-emerald-500"
                        )}
                    >
                        {saved ? (
                            <>
                                <CheckCircle2 className="size-4" />
                                Saved!
                            </>
                        ) : busy ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                {isUploading ? "Uploading..." : "Saving..."}
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
