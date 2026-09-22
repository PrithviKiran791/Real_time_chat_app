"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  userId?: Id<"users"> | null;
  showText?: boolean;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  userId,
  showText = false,
  className,
}) => {
  const presence = useQuery(
    api.presence.getUserPresence,
    userId ? { userId } : "skip"
  );

  if (!presence) {
    return null;
  }

  const isOnline = presence.isOnline;

  if (showText) {
    if (isOnline) {
      return (
        <span className={cn("flex items-center gap-1.5 text-xs text-emerald-500 font-medium", className)}>
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
      );
    }

    if (presence.lastSeenAt) {
      return (
        <span className={cn("text-xs text-muted-foreground", className)}>
          Last seen {formatDistanceToNow(presence.lastSeenAt, { addSuffix: true })}
        </span>
      );
    }

    return <span className={cn("text-xs text-muted-foreground", className)}>Offline</span>;
  }

  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background transition-colors",
        isOnline ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-zinc-400",
        className
      )}
      title={isOnline ? "Online" : presence.lastSeenAt ? `Last seen ${formatDistanceToNow(presence.lastSeenAt, { addSuffix: true })}` : "Offline"}
    />
  );
};
