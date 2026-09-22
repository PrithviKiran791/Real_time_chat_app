"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Edit2, MoreHorizontal, Reply, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface MessageActionsProps {
  message: {
    _id: Id<"messages">;
    content: string[];
    type: string;
    isCurrentUser: boolean;
    deletedAt?: number;
    attachment?: { url: string; name: string };
  };
  onReply: () => void;
  onEdit: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onReply,
  onEdit,
}) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const toggleReactionMutation = useMutation(api.messages.toggleReaction);

  const handleCopy = async () => {
    let textToCopy = message.content[0] || "";
    if (message.attachment) {
      textToCopy = message.attachment.url;
    }
    await navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard");
    setMenuOpen(false);
  };

  const handleReaction = async (emoji: string) => {
    try {
      await toggleReactionMutation({ messageId: message._id, emoji });
    } catch {
      toast.error("Failed to add reaction");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessageMutation({ messageId: message._id });
      toast.success("Message deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete message");
    }
  };

  if (message.deletedAt) return null;

  return (
    <>
      <div className="flex items-center gap-0.5 bg-background/95 backdrop-blur-xs border border-border/80 rounded-full px-1 py-0.5 shadow-xs">
        {/* Quick Reactions */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/60">
          {QUICK_EMOJIS.slice(0, 3).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => void handleReaction(emoji)}
              aria-label={`React with ${emoji}`}
              className="size-6 text-sm flex items-center justify-center hover:scale-125 transition-transform active:scale-95 rounded-full hover:bg-muted"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Reply */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onReply}
          aria-label="Reply to message"
        >
          <Reply className="size-3.5" />
        </Button>

        {/* Dropdown Menu */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Message options"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={message.isCurrentUser ? "end" : "start"} className="w-44">
            {/* Extended Quick Reactions */}
            <div className="flex items-center justify-between p-1.5 border-b border-border/60 mb-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    void handleReaction(emoji);
                    setMenuOpen(false);
                  }}
                  className="size-6 text-base flex items-center justify-center hover:scale-125 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <DropdownMenuItem onClick={onReply} className="flex items-center gap-2 cursor-pointer">
              <Reply className="size-4" />
              Reply
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => void handleCopy()} className="flex items-center gap-2 cursor-pointer">
              <Copy className="size-4" />
              Copy
            </DropdownMenuItem>

            {message.isCurrentUser && message.type === "text" && (
              <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2 cursor-pointer">
                <Edit2 className="size-4" />
                Edit
              </DropdownMenuItem>
            )}

            {message.isCurrentUser && (
              <>
                <div className="my-1 h-px bg-border/60" />
                <DropdownMenuItem
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete message?</DialogTitle>
            <DialogDescription>
              This will remove the message content for everyone in the conversation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleDelete()}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
