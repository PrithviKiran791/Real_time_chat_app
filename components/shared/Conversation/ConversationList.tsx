"use client";

import Link from "next/link";
import { MessageCircle, User, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useConversation } from "@/convex/hooks/useConversation";
import { Badge } from "@/components/ui/badge";

type Conversation = NonNullable<typeof api.conversations.list._returnType>[number];

const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return "";

    const diff = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "now";
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    if (diff < 2 * day) return "Yesterday";

    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(timestamp));
};

const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup) return conversation.name ?? "Group conversation";

    const otherMember = conversation.members.find((member) => member._id !== conversation.currentUserId);
    return otherMember?.username ?? "Direct message";
};

const getPreview = (conversation: Conversation) => {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) return "No messages yet";

    const senderPrefix = lastMessage.isCurrentUser ? "You" : lastMessage.sender?.username ?? "Someone";

    if (lastMessage.type === "image") return `${senderPrefix}: 📷 Photo`;
    if (lastMessage.type === "video") return `${senderPrefix}: 🎥 Video`;
    if (lastMessage.type === "file") {
        try {
            const meta = JSON.parse(lastMessage.content[0]) as { fileName: string };
            return `${senderPrefix}: 📄 ${meta.fileName}`;
        } catch {
            return `${senderPrefix}: 📄 File`;
        }
    }

    const text = lastMessage.content[0] ?? "";
    return `${senderPrefix}: ${text}`;
};

const ConversationAvatar = ({ conversation }: { conversation: Conversation }) => {
    const name = getConversationName(conversation);
    const otherMember = conversation.members.find((member) => member._id !== conversation.currentUserId);
    const imageUrl = conversation.isGroup ? conversation.imageUrl ?? "" : otherMember?.imageUrl ?? "";

    return (
        <Avatar>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>
                {conversation.isGroup ? <Users className="size-4" /> : <User className="size-4" />}
            </AvatarFallback>
        </Avatar>
    );
};

const ConversationList = () => {
    const conversations = useQuery(api.conversations.list);
    const { conversationId } = useConversation();

    if (conversations === undefined) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg border p-2">
                        <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-full animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <MessageCircle className="size-6" />
                </div>
                <div>
                    <p className="font-medium text-foreground">No conversations yet.</p>
                    <p>Start chatting with a friend.</p>
                </div>
            </div>
        );
    }

    return conversations.map((conversation) => {
        const name = getConversationName(conversation);
        const active = conversationId === conversation._id;
        const timestamp = conversation.lastMessage?._creationTime ?? conversation._creationTime;

        return (
            <Link
                key={conversation._id}
                href={`/conversations/${conversation._id}`}
                className={cn(
                    "flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted",
                    active && "border-primary bg-primary/10",
                )}
            >
                <ConversationAvatar conversation={conversation} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-medium">{name}</h3>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                        {conversation.activeCall ? (
                            <p className="truncate text-xs font-semibold text-emerald-500 animate-pulse flex-1 flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                {conversation.activeCall.type === "video" ? "🎥 Video Call Active..." : "📞 Audio Call Active..."}
                            </p>
                        ) : (
                            <p className="truncate text-xs text-muted-foreground flex-1">{getPreview(conversation)}</p>
                        )}
                        {conversation.unseenCount && conversation.unseenCount > 0 ? (
                            <Badge className="shrink-0 size-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                                {conversation.unseenCount}
                            </Badge>
                        ) : null}
                    </div>
                </div>
            </Link>
        );
    });
};

export default ConversationList;
