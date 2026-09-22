"use client";

import React from "react";

interface TypingIndicatorProps {
  typingUsers: Array<{ _id: string; username: string }>;
}

export const TypingIndicator = React.memo<TypingIndicatorProps>(({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  let text = "";
  if (typingUsers.length === 1) {
    text = `${typingUsers[0].username} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
  } else {
    text = `${typingUsers[0].username}, ${typingUsers[1].username} and ${typingUsers.length - 2} others are typing...`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground animate-in fade-in duration-200">
      <div className="flex items-center gap-1 bg-muted/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border/40">
        <span className="flex gap-1 items-center">
          <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-primary animate-bounce" />
        </span>
        <span className="ml-1 text-[11px] font-medium text-foreground/80">{text}</span>
      </div>
    </div>
  );
});
