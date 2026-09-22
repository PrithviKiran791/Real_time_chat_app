"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Phone, PhoneMissed, PhoneOff, Video } from "lucide-react";
import ImageMessage from "./messages/ImageMessage";
import VideoMessage from "./messages/VideoMessage";
import FileMessage from "./messages/FileMessage";
import { MessageActions } from "./MessageActions";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type EnrichedMessage = {
  _id: Id<"messages">;
  _creationTime: number;
  senderId: Id<"users">;
  conversationId: Id<"conversations">;
  type: string;
  content: string[];
  isCurrentUser: boolean;
  isEdited?: boolean;
  deletedAt?: number;
  attachment?: {
    url: string;
    name: string;
    size: number;
    mimeType: string;
  };
  replyToDetails?: {
    _id: Id<"messages">;
    text: string;
    senderName: string;
    type: string;
  } | null;
  sender: {
    _id: Id<"users">;
    username: string;
    imageUrl: string;
    displayName?: string;
    customImageUrl?: string;
  } | null;
  readBy?: Array<{ _id: Id<"users">; username: string }>;
  reactions?: Array<{ emoji: string; userId: Id<"users">; isCurrentUser: boolean }>;
  callInfo?: {
    type: "audio" | "video";
    status: string;
    duration?: number;
  };
};

interface MessageItemProps {
  message: EnrichedMessage;
  previousMessage?: EnrichedMessage;
  isGroup: boolean;
  onReply: (message: EnrichedMessage) => void;
  onEdit: (message: EnrichedMessage) => void;
  onSelectUser: (userId: Id<"users">) => void;
}

export const MessageItem = React.memo<MessageItemProps>(
  ({
    message,
    previousMessage,
    isGroup,
    onReply,
    onEdit,
    onSelectUser,
  }) => {
  const [isHovered, setIsHovered] = useState(false);
  const toggleReactionMutation = useMutation(api.messages.toggleReaction);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatMessageTime = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(timestamp));
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Check if message should be grouped with previous
  const grouped =
    previousMessage &&
    previousMessage.senderId === message.senderId &&
    message._creationTime - previousMessage._creationTime < 60000 &&
    message.type !== "call" &&
    previousMessage.type !== "call";

  const senderName = message.sender?.displayName || message.sender?.username || "Unknown";
  const avatarUrl = message.sender?.customImageUrl || message.sender?.imageUrl || "";

  // Handle reaction click
  const handleReactionClick = async (emoji: string) => {
    try {
      await toggleReactionMutation({ messageId: message._id, emoji });
    } catch {}
  };

  // Group reactions by emoji
  const groupedReactions = (message.reactions ?? []).reduce<
    Record<string, { count: number; hasUser: boolean }>
  >((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { count: 0, hasUser: false };
    }
    acc[r.emoji].count += 1;
    if (r.isCurrentUser) acc[r.emoji].hasUser = true;
    return acc;
  }, {});

  // Mobile long-press handler
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Call System Message
  if (message.type === "call") {
    let callType = "audio";
    let callStatus = "completed";
    let duration = 0;

    if (message.callInfo) {
      callType = message.callInfo.type;
      callStatus = message.callInfo.status;
      duration = message.callInfo.duration || 0;
    } else {
      try {
        const parsed = JSON.parse(message.content[0]);
        callType = parsed.type || "audio";
        callStatus = parsed.status || "completed";
        duration = parsed.duration || 0;
      } catch {}
    }

    const isMissed = callStatus === "missed";
    const isDeclined = callStatus === "declined";

    return (
      <div className="flex justify-center my-3 animate-in fade-in duration-200">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/60 bg-muted/40 text-xs text-muted-foreground shadow-2xs">
          {isMissed ? (
            <PhoneMissed className="size-4 text-red-500 shrink-0" />
          ) : isDeclined ? (
            <PhoneOff className="size-4 text-amber-500 shrink-0" />
          ) : callType === "video" ? (
            <Video className="size-4 text-emerald-500 shrink-0" />
          ) : (
            <Phone className="size-4 text-emerald-500 shrink-0" />
          )}

          <span>
            {isMissed
              ? `Missed ${callType} call`
              : isDeclined
              ? `Call declined`
              : `${callType === "video" ? "Video" : "Voice"} call (${formatDuration(duration) || "< 1m"})`}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            • {formatMessageTime(message._creationTime)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      className={cn(
        "group relative flex items-end gap-2 px-4 transition-colors",
        message.isCurrentUser ? "justify-end" : "justify-start",
        grouped ? "mt-1" : "mt-3"
      )}
    >
      {/* Sender Avatar */}
      {!message.isCurrentUser ? (
        <div className="w-8 shrink-0">
          {!grouped ? (
            <Avatar
              className="size-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelectUser(message.senderId)}
            >
              <AvatarImage src={avatarUrl} alt={senderName} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold">
                {senderName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "relative max-w-[75%] sm:max-w-[65%]",
          message.isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {/* Sender Name in Group Chat */}
        {!message.isCurrentUser && !grouped && isGroup ? (
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            {senderName}
          </span>
        ) : null}

        {/* Reply Quote Banner */}
        {message.replyToDetails && !message.deletedAt && (
          <div
            className={cn(
              "mb-1 flex flex-col rounded-md border-l-2 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground",
              message.isCurrentUser ? "border-primary" : "border-primary/60"
            )}
          >
            <span className="font-semibold text-[11px] text-foreground/80">
              {message.replyToDetails.senderName}
            </span>
            <span className="truncate">{message.replyToDetails.text}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm shadow-2xs transition-all",
            message.isCurrentUser
              ? "rounded-br-xs bg-primary text-primary-foreground"
              : "rounded-bl-xs bg-muted text-foreground border border-border/40",
            message.deletedAt && "italic text-muted-foreground bg-muted/30 border-dashed"
          )}
        >
          {message.deletedAt ? (
            <p className="text-xs">This message was deleted</p>
          ) : message.type === "image" ? (
            message.attachment ? (
              <ImageMessage fileUrl={message.attachment.url} fileName={message.attachment.name} />
            ) : (
              (() => {
                try {
                  const meta = JSON.parse(message.content[0]);
                  return <ImageMessage fileUrl={meta.fileUrl} fileName={meta.fileName} />;
                } catch {
                  return <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>;
                }
              })()
            )
          ) : message.type === "video" ? (
            message.attachment ? (
              <VideoMessage fileUrl={message.attachment.url} fileName={message.attachment.name} />
            ) : (
              (() => {
                try {
                  const meta = JSON.parse(message.content[0]);
                  return <VideoMessage fileUrl={meta.fileUrl} fileName={meta.fileName} />;
                } catch {
                  return <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>;
                }
              })()
            )
          ) : message.type === "file" ? (
            message.attachment ? (
              <FileMessage
                fileUrl={message.attachment.url}
                fileName={message.attachment.name}
                fileSize={message.attachment.size}
                mimeType={message.attachment.mimeType}
              />
            ) : (
              (() => {
                try {
                  const meta = JSON.parse(message.content[0]);
                  return (
                    <FileMessage
                      fileUrl={meta.fileUrl}
                      fileName={meta.fileName}
                      fileSize={meta.fileSize}
                      mimeType={meta.mimeType}
                    />
                  );
                } catch {
                  return <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>;
                }
              })()
            )
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>
          )}

          {/* Edited indicator */}
          {message.isEdited && !message.deletedAt && (
            <span className="ml-1.5 text-[10px] opacity-70">(edited)</span>
          )}
        </div>

        {/* Reaction Pills */}
        {Object.keys(groupedReactions).length > 0 && !message.deletedAt && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => void handleReactionClick(emoji)}
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-all active:scale-95",
                  data.hasUser
                    ? "bg-primary/15 border-primary/40 text-primary font-medium"
                    : "bg-muted/80 border-border/70 text-foreground/80 hover:bg-muted"
                )}
              >
                <span>{emoji}</span>
                <span className="text-[10px]">{data.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp & Read Status */}
        {(!grouped || message.isCurrentUser) && (
          <div
            className={cn(
              "flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground",
              message.isCurrentUser ? "justify-end" : "justify-start"
            )}
          >
            <span>{formatMessageTime(message._creationTime)}</span>
            {message.isCurrentUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help flex items-center">
                    {message.readBy && message.readBy.length > 0 ? (
                      <CheckCheck className="size-3.5 text-emerald-500" />
                    ) : (
                      <Check className="size-3.5 text-muted-foreground" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {message.readBy && message.readBy.length > 0 ? (
                    <span>
                      {isGroup
                        ? `Read by ${message.readBy.map((m) => m.username).join(", ")}`
                        : "Read"}
                    </span>
                  ) : (
                    <span>Sent</span>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Toolbar on Hover */}
      {isHovered && !message.deletedAt && (
        <div
          className={cn(
            "absolute -top-3 z-10 animate-in fade-in zoom-in-95 duration-150",
            message.isCurrentUser ? "right-6" : "left-12"
          )}
        >
          <MessageActions
            message={message}
            onReply={() => onReply(message)}
            onEdit={() => onEdit(message)}
          />
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message._id === nextProps.message._id &&
    prevProps.message._creationTime === nextProps.message._creationTime &&
    prevProps.message.isEdited === nextProps.message.isEdited &&
    prevProps.message.deletedAt === nextProps.message.deletedAt &&
    prevProps.message.content[0] === nextProps.message.content[0] &&
    prevProps.message.reactions?.length === nextProps.message.reactions?.length &&
    prevProps.message.readBy?.length === nextProps.message.readBy?.length &&
    prevProps.previousMessage?._id === nextProps.previousMessage?._id &&
    prevProps.previousMessage?.senderId === nextProps.previousMessage?.senderId &&
    prevProps.isGroup === nextProps.isGroup
  );
});
