import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const useTyping = (conversationId?: Id<"conversations"> | string | null) => {
  const setTypingMutation = useMutation(api.typing.setTyping);
  
  const validId = conversationId && conversationId.length > 0 ? (conversationId as Id<"conversations">) : null;
  const typingUsers = useQuery(
    api.typing.getTyping,
    validId ? { conversationId: validId } : "skip"
  ) ?? [];

  const isTypingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef(0);

  const stopTyping = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (isTypingRef.current && validId) {
      isTypingRef.current = false;
      void setTypingMutation({ conversationId: validId, isTyping: false }).catch(() => {});
    }
  }, [validId, setTypingMutation]);

  const handleTyping = useCallback(() => {
    if (!validId) return;
    const now = Date.now();

    // Send heartbeat every 1500ms max to prevent flooding mutations
    if (!isTypingRef.current || now - lastSentRef.current > 1500) {
      isTypingRef.current = true;
      lastSentRef.current = now;
      void setTypingMutation({ conversationId: validId, isTyping: true }).catch(() => {});
    }

    // Reset debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      stopTyping();
    }, 1800);
  }, [validId, setTypingMutation, stopTyping]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (isTypingRef.current && validId) {
        void setTypingMutation({ conversationId: validId, isTyping: false }).catch(() => {});
      }
    };
  }, [validId, setTypingMutation]);

  return {
    typingUsers,
    handleTyping,
    stopTyping,
  };
};
