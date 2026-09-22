"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Send,
  Users,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  X,
  Edit2,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useConversation } from "@/convex/hooks/useConversation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ViewMembersDialog from "./ViewMembersDialog";
import LeaveGroupDialog from "./LeaveGroupDialog";
import DeleteGroupDialog from "./DeleteGroupDialog";
import AttachmentPopover from "./AttachmentPopover";
import EmojiPickerButton from "./EmojiPickerButton";
import { useCall } from "@/components/shared/CallProvider";
import CallScreen from "./CallScreen";
import { UserProfileDialog } from "@/components/shared/profile/UserProfileDialog";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";
import { PresenceIndicator } from "./PresenceIndicator";
import { useTyping } from "@/hooks/useTyping";
import type { EnrichedMessage } from "./MessageItem";
import { toast } from "sonner";

const ActiveConversation = () => {
  const { conversationId } = useConversation();
  const typedConversationId = conversationId as Id<"conversations">;

  const conversation = useQuery(
    api.conversations.get,
    conversationId ? { id: typedConversationId } : "skip"
  );

  const sendMessageMutation = useMutation(api.messages.send);
  const editMessageMutation = useMutation(api.messages.edit);
  const markAsRead = useMutation(api.conversations.markAsRead);

  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<EnrichedMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<EnrichedMessage | null>(null);
  const [editText, setEditText] = useState("");

  const [viewMembersOpen, setViewMembersOpen] = useState(false);
  const [leaveGroupOpen, setLeaveGroupOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | undefined>(undefined);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { activeCall, isConnecting, startCall, joinCall, leaveCall } = useCall();
  const isUserInCurrentCall = activeCall && activeCall.conversationId === conversationId;

  // Typing hook
  const { typingUsers, handleTyping, stopTyping } = useTyping(typedConversationId);

  // Mark conversation as read on load
  useEffect(() => {
    if (conversationId && conversation) {
      void markAsRead({ conversationId: typedConversationId }).catch(() => {});
    }
  }, [conversationId, conversation, markAsRead, typedConversationId]);

  const otherMember = useMemo(() => {
    if (!conversation) return null;
    return conversation.members.find((member) => member._id !== conversation.currentUserId);
  }, [conversation]);

  const title = useMemo(() => {
    if (!conversation) return "";
    if (conversation.isGroup) return conversation.name ?? "Group conversation";
    return otherMember ? (otherMember.displayName ?? otherMember.username) : "Direct message";
  }, [conversation, otherMember]);

  const avatarUrl = conversation?.isGroup
    ? conversation.imageUrl ?? ""
    : (otherMember?.customImageUrl ?? otherMember?.imageUrl ?? "");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    handleTyping();
  };

  const handleEmojiSelect = (emoji: string) => {
    setBody((prev) => prev + emoji);
    handleTyping();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const content = body.trim();

    if (!content) {
      setError("Message cannot be empty.");
      return;
    }

    setError("");
    setSending(true);
    stopTyping();

    try {
      await sendMessageMutation({
        conversationId: typedConversationId,
        content,
        type: "text",
        replyTo: replyingTo ? replyingTo._id : undefined,
      });

      setBody("");
      setReplyingTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleStartEdit = (message: EnrichedMessage) => {
    setEditingMessage(message);
    setEditText(message.content[0] || "");
  };

  const handleSaveEdit = async () => {
    if (!editingMessage) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      await editMessageMutation({
        messageId: editingMessage._id,
        content: trimmed,
      });
      toast.success("Message edited");
      setEditingMessage(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to edit message");
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 shrink-0 bg-background/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          <Link
            href="/conversations"
            className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="size-5" />
          </Link>

          {/* Avatar with Presence indicator */}
          <div className="relative shrink-0">
            <Avatar
              className="size-10 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                if (!conversation.isGroup && otherMember) {
                  setSelectedUserId(otherMember._id);
                }
              }}
            >
              <AvatarImage src={avatarUrl} alt={title} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {conversation.isGroup ? (
                  <Users className="size-5" />
                ) : (
                  title.substring(0, 2).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            {!conversation.isGroup && otherMember && (
              <PresenceIndicator userId={otherMember._id} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
            {conversation.isGroup ? (
              <p className="text-xs text-muted-foreground">
                {conversation.members.length} members
              </p>
            ) : otherMember ? (
              <PresenceIndicator userId={otherMember._id} showText={true} />
            ) : null}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Call */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void startCall(conversationId, "audio")}
            disabled={isConnecting || !!activeCall}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Start voice call"
          >
            <Phone className="size-4" />
          </Button>

          {/* Video Call */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void startCall(conversationId, "video")}
            disabled={isConnecting || !!activeCall}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Start video call"
          >
            <Video className="size-4" />
          </Button>

          {/* Group dropdown */}
          {conversation.isGroup && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Group settings">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMembersOpen(true)}>
                  View Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLeaveGroupOpen(true)}>
                  Leave Group
                </DropdownMenuItem>
                {conversation.ownerId === conversation.currentUserId && (
                  <DropdownMenuItem
                    onClick={() => setDeleteGroupOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Group
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Active Call View */}
      {isUserInCurrentCall && activeCall ? (
        <CallScreen
          token={activeCall.token}
          video={activeCall.type === "video"}
          onLeave={() => void leaveCall()}
        />
      ) : (
        <>
          {/* Active Call Banner if active elsewhere in group */}
          {conversation.activeCall && !isUserInCurrentCall && (
            <div className="flex items-center justify-between bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {conversation.activeCall.type === "video" ? "Video" : "Audio"} call in progress...
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-emerald-500/30 hover:bg-emerald-500/20"
                onClick={() => void joinCall(conversationId)}
              >
                Join Call
              </Button>
            </div>
          )}

          {/* Paginated Message List */}
          <MessageList
            conversationId={typedConversationId}
            isGroup={conversation.isGroup}
            onReply={(msg) => {
              setReplyingTo(msg);
              inputRef.current?.focus();
            }}
            onEdit={handleStartEdit}
            onSelectUser={(userId) => setSelectedUserId(userId)}
          />

          {/* Real-Time Typing Indicator */}
          <TypingIndicator typingUsers={typingUsers} />

          {/* Message Composer Area */}
          <div className="border-t bg-background/95 backdrop-blur-xs p-3">
            {/* Reply Preview Banner */}
            {replyingTo && (
              <div className="mb-2 flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1 h-6 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground/90 text-[11px]">
                      Replying to {replyingTo.sender?.displayName || replyingTo.sender?.username || "user"}
                    </p>
                    <p className="truncate text-muted-foreground text-[11px]">
                      {replyingTo.content[0] || (replyingTo.attachment ? replyingTo.attachment.name : "")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setReplyingTo(null)}
                  aria-label="Cancel reply"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)}>
              <div className="flex items-end gap-2">
                <AttachmentPopover disabled={sending} conversationId={typedConversationId} />
                <EmojiPickerButton disabled={sending} onEmojiSelect={handleEmojiSelect} />

                <textarea
                  ref={inputRef}
                  value={body}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  rows={1}
                  placeholder="Type a message..."
                  className="min-h-9 max-h-32 flex-1 resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || body.trim().length === 0}
                  className="size-9 rounded-xl shadow-xs"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
            </form>
          </div>
        </>
      )}

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={(open) => !open && setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="size-4 text-primary" />
              Edit Message
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-input bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              placeholder="Edit your message..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveEdit()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Dialogs */}
      {conversation.isGroup && conversation.groupId ? (
        <>
          <ViewMembersDialog
            open={viewMembersOpen}
            onOpenChange={setViewMembersOpen}
            groupId={conversation.groupId}
          />
          <LeaveGroupDialog
            open={leaveGroupOpen}
            onOpenChange={setLeaveGroupOpen}
            groupId={conversation.groupId}
          />
          <DeleteGroupDialog
            open={deleteGroupOpen}
            onOpenChange={setDeleteGroupOpen}
            groupId={conversation.groupId}
          />
        </>
      ) : null}

      {/* User Profile Dialog */}
      <UserProfileDialog
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(undefined);
        }}
      />
    </div>
  );
};

export default ActiveConversation;
