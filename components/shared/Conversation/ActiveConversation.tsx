"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Send, User, Users, MoreVertical, Check, CheckCheck, Phone, Video, PhoneOff } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConversation } from "@/convex/hooks/useConversation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ViewMembersDialog from "./ViewMembersDialog";
import LeaveGroupDialog from "./LeaveGroupDialog";
import DeleteGroupDialog from "./DeleteGroupDialog";
import AttachmentPopover from "./AttachmentPopover";
import EmojiPickerButton from "./EmojiPickerButton";
import ImageMessage from "./messages/ImageMessage";
import VideoMessage from "./messages/VideoMessage";
import FileMessage from "./messages/FileMessage";
import { useCall } from "@/components/shared/CallProvider";
import CallScreen from "./CallScreen";

const formatMessageTime = (timestamp: number) => {
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(timestamp));
};

const ActiveConversation = () => {
    const { conversationId } = useConversation();
    const typedConversationId = conversationId as Id<"conversations">;
    const conversation = useQuery(
        api.conversations.get,
        conversationId ? { id: typedConversationId } : "skip",
    );
    const messages = useQuery(
        api.conversations.messages,
        conversationId ? { conversationId: typedConversationId } : "skip",
    );
    const sendMessage = useMutation(api.conversations.sendMessage);
    const markAsRead = useMutation(api.conversations.markAsRead);
    const [body, setBody] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [viewMembersOpen, setViewMembersOpen] = useState(false);
    const [leaveGroupOpen, setLeaveGroupOpen] = useState(false);
    const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const { activeCall, isConnecting, startCall, joinCall, leaveCall } = useCall();
    const isUserInCurrentCall = activeCall && activeCall.conversationId === conversationId;

    useEffect(() => {
        if (conversationId && messages && messages.length > 0) {
            const latestMsg = messages[messages.length - 1];
            void markAsRead({
                conversationId: typedConversationId,
                messageId: latestMsg._id,
            });
        }
    }, [conversationId, messages, markAsRead, typedConversationId]);

    const title = useMemo(() => {
        if (!conversation) return "";
        if (conversation.isGroup) return conversation.name ?? "Group conversation";

        return conversation.members.find((member) => member._id !== conversation.currentUserId)?.username ?? "Direct message";
    }, [conversation]);

    const otherMember = conversation?.members.find((member) => member._id !== conversation.currentUserId);
    const avatarUrl = conversation?.isGroup ? conversation.imageUrl ?? "" : otherMember?.imageUrl ?? "";

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages?.length, conversationId]);

    const handleSubmit = async (event?: FormEvent) => {
        event?.preventDefault();
        const content = body.trim();

        if (!content) {
            setError("Message cannot be empty.");
            return;
        }

        setError("");
        setSending(true);

        try {
            await sendMessage({ conversationId: typedConversationId, content });
            setBody("");
            requestAnimationFrame(() => inputRef.current?.focus());
        } catch {
            setError("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSubmit();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setBody((prev) => prev + emoji);
        requestAnimationFrame(() => {
            const ta = inputRef.current;
            if (!ta) return;
            ta.focus();
            const len = ta.value.length;
            ta.setSelectionRange(len, len);
        });
    };

    if (conversation === undefined || messages === undefined) {
        return (
            <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b p-3">
                    <div className="size-10 animate-pulse rounded-full bg-muted" />
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={cn("h-12 max-w-[70%] animate-pulse rounded-lg bg-muted", index % 2 && "self-end")} />
                    ))}
                </div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Conversation unavailable.</p>
                <p>It may have been deleted or you may no longer have access.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <header className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar size="lg">
                        <AvatarImage src={avatarUrl} alt={title} />
                        <AvatarFallback>{conversation.isGroup ? <Users className="size-5" /> : <User className="size-5" />}</AvatarFallback>
                        {!conversation.isGroup ? <AvatarBadge className="bg-emerald-500" /> : null}
                    </Avatar>
                    <div className="min-w-0">
                        <h2 className="truncate font-semibold">{title}</h2>
                        {conversation.activeCall ? (
                            <p className="text-xs text-emerald-500 font-semibold animate-pulse flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                {conversation.activeCall.type === "video" ? "Video Call Active" : "Audio Call Active"}{" "}
                                ({conversation.activeCall.participants.length} in call)
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                {conversation.isGroup ? `${conversation.members.length} members` : "Online"}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {conversation.activeCall ? (
                        !isUserInCurrentCall ? (
                            <Button
                                type="button"
                                onClick={() => void joinCall(conversation._id)}
                                disabled={isConnecting}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-lg flex items-center gap-1.5 animate-pulse"
                            >
                                {conversation.activeCall.type === "video" ? <Video className="size-3.5" /> : <Phone className="size-3.5" />}
                                Join Call
                            </Button>
                        ) : null
                    ) : (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        onClick={() => void startCall(conversation._id, "audio")}
                                        disabled={isConnecting || !!activeCall}
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 rounded-lg text-muted-foreground hover:text-foreground"
                                        aria-label="Start Audio Call"
                                    >
                                        <Phone className="size-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Audio Call</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        onClick={() => void startCall(conversation._id, "video")}
                                        disabled={isConnecting || !!activeCall}
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 rounded-lg text-muted-foreground hover:text-foreground"
                                        aria-label="Start Video Call"
                                    >
                                        <Video className="size-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Video Call</TooltipContent>
                            </Tooltip>
                        </>
                    )}

                    {conversation.isGroup ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="icon" variant="ghost" className="size-9 rounded-lg" aria-label="Group options">
                                    <MoreVertical className="size-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewMembersOpen(true)}>
                                    View Members
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLeaveGroupOpen(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Leave Group
                                </DropdownMenuItem>
                                {conversation.ownerId === conversation.currentUserId ? (
                                    <DropdownMenuItem onClick={() => setDeleteGroupOpen(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                        Delete Group
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
            </header>

            {isUserInCurrentCall ? (
                <div className="flex-1 min-h-0 p-3">
                    <CallScreen
                        token={activeCall.token}
                        video={activeCall.type === "video"}
                        onLeave={leaveCall}
                    />
                </div>
            ) : (
                <>
                    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
                        {messages.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">No messages yet.</p>
                                <p>Say hello!</p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const previousMessage = messages[index - 1];
                                const grouped = previousMessage?.senderId === message.senderId;
                                const senderName = message.sender?.username ?? "Unknown";

                                return (
                                    <div
                                        key={message._id}
                                        className={cn("flex gap-2", grouped ? "mt-1" : "mt-4", message.isCurrentUser && "justify-end")}
                                    >
                                        {!message.isCurrentUser ? (
                                            grouped ? (
                                                <div className="size-8 shrink-0" />
                                            ) : (
                                                <Avatar>
                                                    <AvatarImage src={message.sender?.imageUrl ?? ""} alt={senderName} />
                                                    <AvatarFallback><User className="size-4" /></AvatarFallback>
                                                </Avatar>
                                            )
                                        ) : null}
                                        <div className={cn("flex max-w-[75%] flex-col", message.isCurrentUser && "items-end")}>
                                            {!message.isCurrentUser && !grouped ? (
                                                <span className="mb-1 text-xs font-medium text-muted-foreground">{senderName}</span>
                                            ) : null}
                                            <div
                                                className={cn(
                                                    "rounded-lg text-sm",
                                                    message.type === "text" && (message.isCurrentUser ? "bg-primary text-primary-foreground px-3 py-2" : "bg-muted text-foreground px-3 py-2"),
                                                )}
                                            >
                                                {message.type === "image" ? (() => {
                                                    try {
                                                        const meta = JSON.parse(message.content[0]) as { fileUrl: string; fileName: string };
                                                        return <ImageMessage fileUrl={meta.fileUrl} fileName={meta.fileName} />;
                                                    } catch { return <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>; }
                                                })() : message.type === "video" ? (() => {
                                                    try {
                                                        const meta = JSON.parse(message.content[0]) as { fileUrl: string; fileName: string };
                                                        return <VideoMessage fileUrl={meta.fileUrl} fileName={meta.fileName} />;
                                                    } catch { return <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>; }
                                                })() : message.type === "file" ? (() => {
                                                    try {
                                                        const meta = JSON.parse(message.content[0]) as { fileUrl: string; fileName: string; fileSize: number; mimeType: string };
                                                        return <FileMessage fileUrl={meta.fileUrl} fileName={meta.fileName} fileSize={meta.fileSize} mimeType={meta.mimeType} />;
                                                    } catch { return <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>; }
                                                })() : (
                                                    <p className="whitespace-pre-wrap break-words">{message.content[0]}</p>
                                                )}
                                            </div>
                                            {(!grouped || message.isCurrentUser) ? (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {!grouped ? (
                                                        <span className="text-[11px] text-muted-foreground">{formatMessageTime(message._creationTime)}</span>
                                                    ) : null}
                                                    {message.isCurrentUser ? (
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
                                                                        {conversation.isGroup
                                                                            ? `Seen by: ${message.readBy.map((m) => m.username).join(", ")}`
                                                                            : "Read"}
                                                                    </span>
                                                                ) : (
                                                                    <span>Sent</span>
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={endRef} />
                    </div>

                    <form className="border-t p-3" onSubmit={(event) => void handleSubmit(event)}>
                        <div className="flex items-end gap-2">
                            <AttachmentPopover disabled={sending} conversationId={typedConversationId} />
                            <EmojiPickerButton disabled={sending} onEmojiSelect={handleEmojiSelect} />
                            <textarea
                                ref={inputRef}
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={sending}
                                rows={1}
                                placeholder="Type a message"
                                className="min-h-9 max-h-28 flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <Button type="submit" size="icon" disabled={sending || body.trim().length === 0} aria-label="Send message">
                                <Send className="size-4" />
                            </Button>
                        </div>
                        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
                    </form>
                </>
            )}
            {conversation.isGroup && conversation.groupId ? (
                <>
                    <ViewMembersDialog open={viewMembersOpen} onOpenChange={setViewMembersOpen} groupId={conversation.groupId} />
                    <LeaveGroupDialog open={leaveGroupOpen} onOpenChange={setLeaveGroupOpen} groupId={conversation.groupId} />
                    <DeleteGroupDialog open={deleteGroupOpen} onOpenChange={setDeleteGroupOpen} groupId={conversation.groupId} />
                </>
            ) : null}
        </div>
    );
};

export default ActiveConversation;
