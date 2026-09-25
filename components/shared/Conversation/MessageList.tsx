"use client";

import React, { useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MessageItem, type EnrichedMessage } from "./MessageItem";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";

interface MessageListProps {
  conversationId?: Id<"conversations"> | string | null;
  isGroup: boolean;
  onReply: (message: EnrichedMessage) => void;
  onEdit: (message: EnrichedMessage) => void;
  onSelectUser: (userId: Id<"users">) => void;
}

export const MessageList = React.memo<MessageListProps>(({
  conversationId,
  isGroup,
  onReply,
  onEdit,
  onSelectUser,
}) => {
  const validId = conversationId && conversationId.length > 0 ? (conversationId as Id<"conversations">) : null;
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.messages.paginate,
    validId ? { conversationId: validId } : "skip",
    { initialNumItems: 35 }
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const isPrependingRef = useRef(false);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const isFirstLoadRef = useRef(true);
  const lastMessageCountRef = useRef(0);

  // Messages are returned desc from convex, so reverse for top-to-bottom display
  const messages = useMemo(() => {
    return [...results].reverse() as EnrichedMessage[];
  }, [results]);

  // Initial load auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && isFirstLoadRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      isFirstLoadRef.current = false;
      lastMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Auto-scroll on new message if already near bottom
  useEffect(() => {
    if (!isFirstLoadRef.current && containerRef.current) {
      const container = containerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 120;

      if (!isPrependingRef.current && isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages]);

  // Scroll anchoring: maintain exact position when older messages are loaded into the DOM
  useLayoutEffect(() => {
    if (isPrependingRef.current && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      containerRef.current.scrollTop = prevScrollTopRef.current + diff;
      isPrependingRef.current = false;
    }
  }, [messages]);

  // Handle scroll near top to load more
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;

    if (scrollTop < 70 && status === "CanLoadMore" && !isLoading) {
      isPrependingRef.current = true;
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
      prevScrollTopRef.current = containerRef.current.scrollTop;
      loadMore(20);
    }
  }, [status, isLoading, loadMore]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex min-h-0 flex-1 flex-col space-y-1 overflow-y-auto overscroll-contain touch-pan-y will-change-scroll px-1 py-4"
    >
      {/* Top status indicator: Loading older messages or Start of Conversation */}
      <div className="py-3 flex justify-center text-xs text-muted-foreground">
        {isLoading && status === "LoadingMore" ? (
          <div className="flex items-center gap-2 bg-muted/60 px-3 py-1 rounded-full border border-border/40 shadow-2xs">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span>Loading older messages...</span>
          </div>
        ) : status === "Exhausted" && messages.length > 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-4 text-center">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="size-4" />
            </div>
            <p className="font-semibold text-foreground/80">Beginning of conversation</p>
            <p className="text-[11px] text-muted-foreground">
              This is the very start of your message history.
            </p>
          </div>
        ) : null}
      </div>

      {/* Empty conversation placeholder */}
      {messages.length === 0 && !isLoading ? (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground p-6">
          <div className="size-14 rounded-2xl bg-muted/80 flex items-center justify-center text-primary shadow-xs">
            <MessageCircle className="size-7" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">No messages yet</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Say hello or send an attachment to start the conversation!
            </p>
          </div>
        </div>
      ) : null}

      {/* Message Items list */}
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : undefined;
        return (
          <MessageItem
            key={message._id}
            message={message}
            previousMessage={previousMessage}
            isGroup={isGroup}
            onReply={onReply}
            onEdit={onEdit}
            onSelectUser={onSelectUser}
          />
        );
      })}
    </div>
  );
});

export default MessageList;
