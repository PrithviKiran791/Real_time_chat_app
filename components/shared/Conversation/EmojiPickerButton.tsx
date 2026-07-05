"use client";

import { lazy, Suspense, useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { EmojiClickData, Theme } from "emoji-picker-react";

// Lazy-load the picker so it doesn't bloat the initial bundle
const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface EmojiPickerButtonProps {
    disabled?: boolean;
    onEmojiSelect: (emoji: string) => void;
}

const EmojiPickerButton = ({ disabled, onEmojiSelect }: EmojiPickerButtonProps) => {
    const [open, setOpen] = useState(false);

    const handleEmojiClick = (data: EmojiClickData) => {
        onEmojiSelect(data.emoji);
        setOpen(false);
    };

    // Detect current theme for the picker
    const isDark =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

    const theme: Theme = isDark ? ("dark" as Theme) : ("light" as Theme);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={disabled}
                            aria-label="Pick an emoji"
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                            <Smile className="size-4" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">Emoji</TooltipContent>
            </Tooltip>

            <PopoverContent
                side="top"
                align="start"
                sideOffset={8}
                className="w-auto border-none bg-transparent p-0 shadow-none"
            >
                <Suspense
                    fallback={
                        <div className="flex h-[350px] w-[300px] items-center justify-center rounded-lg border bg-popover text-sm text-muted-foreground shadow-md">
                            Loading…
                        </div>
                    }
                >
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={theme}
                        lazyLoadEmojis
                        searchPlaceholder="Search emojis…"
                        height={350}
                        width={300}
                    />
                </Suspense>
            </PopoverContent>
        </Popover>
    );
};

export default EmojiPickerButton;
