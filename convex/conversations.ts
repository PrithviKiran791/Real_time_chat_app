import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrNull } from "./_utils";

type MemberInfo = {
  _id: Id<"users">;
  username: string;
  imageUrl: string;
  email: string;
  displayName: string | undefined;
  customImageUrl: string | undefined;
};

type SenderInfo = {
  _id: Id<"users">;
  username: string;
  imageUrl: string;
  displayName: string | undefined;
  customImageUrl: string | undefined;
};

type ConversationWithDetails = Doc<"conversations"> & {
  currentUserId: Id<"users">;
  members: Array<MemberInfo>;
  lastMessage:
    | (Doc<"messages"> & {
        sender: SenderInfo | null;
        isCurrentUser: boolean;
      })
    | null;
  imageUrl?: string;
  ownerId?: Id<"users">;
};

const getConversationMember = async (
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
  memberId: Id<"users">,
) => {
  return await ctx.db
    .query("conversationMembers")
    .withIndex("By_memberId_conversationId", (q) => q.eq("memberId", memberId).eq("conversationId", conversationId))
    .unique();
};

const requireConversationMember = async (
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
  memberId: Id<"users">,
) => {
  const membership = await getConversationMember(ctx, conversationId, memberId);

  if (!membership) {
    throw new ConvexError("You do not have access to this conversation");
  }

  return membership;
};

const getConversationWithDetails = async (
  ctx: QueryCtx,
  conversation: Doc<"conversations">,
  currentUserId: Id<"users">,
): Promise<ConversationWithDetails> => {
  const memberRows = await ctx.db
    .query("conversationMembers")
    .withIndex("By_conversationId", (q) => q.eq("conversationId", conversation._id))
    .take(100);

  const members = (
    await Promise.all(
      memberRows.map(async (member) => {
        const user = await ctx.db.get(member.memberId);
        if (!user) return null;

        return {
          _id: user._id,
          username: user.username,
          imageUrl: user.imageUrl,
          email: user.email,
          displayName: user.displayName,
          customImageUrl: user.customImageUrl,
        };
      }),
    )
  ).filter((member): member is ConversationWithDetails["members"][number] => member !== null);

  const lastMessage = conversation.lastMessageId ? await ctx.db.get(conversation.lastMessageId) : null;
  const sender = lastMessage ? await ctx.db.get(lastMessage.senderId) : null;

  let groupName = conversation.name;
  let imageUrl = undefined;
  let ownerId = undefined;

  if (conversation.isGroup && conversation.groupId) {
    const group = await ctx.db.get(conversation.groupId);
    if (group) {
      groupName = group.name;
      imageUrl = group.imageUrl;
      ownerId = group.ownerId;
    }
  }

  return {
    ...conversation,
    name: groupName,
    imageUrl,
    ownerId,
    currentUserId,
    members,
    lastMessage: lastMessage
      ? {
          ...lastMessage,
          isCurrentUser: lastMessage.senderId === currentUserId,
          sender: sender
            ? {
                _id: sender._id,
                username: sender.username,
                imageUrl: sender.imageUrl,
                displayName: sender.displayName,
                customImageUrl: sender.customImageUrl,
              }
            : null,
        }
      : null,
  };
};

const getUnseenCount = async (
  ctx: QueryCtx,
  conversationId: Id<"conversations">,
  userId: Id<"users">,
  lastseenMessageId?: Id<"messages">
) => {
  let lastseenTime = 0;
  if (lastseenMessageId) {
    const lastMessage = await ctx.db.get(lastseenMessageId);
    if (lastMessage) {
      lastseenTime = lastMessage._creationTime;
    }
  }

  const unreadMessages = await ctx.db
    .query("messages")
    .withIndex("By_conversationId", (q) => q.eq("conversationId", conversationId))
    .order("desc")
    .take(100);

  let count = 0;
  for (const msg of unreadMessages) {
    if (msg._creationTime <= lastseenTime) {
      break;
    }
    if (msg.senderId !== userId) {
      count++;
    }
  }
  return count;
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserOrNull(ctx);

    if (!currentUser) {
      return [];
    }

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("By_memberId", (q) => q.eq("memberId", currentUser._id))
      .take(100);

    const conversations = (
      await Promise.all(
        memberships.map(async (membership) => {
          const conversation = await ctx.db.get(membership.conversationId);
          if (!conversation) return null;

          const details = await getConversationWithDetails(ctx, conversation, currentUser._id);
          const unseenCount = await getUnseenCount(
            ctx,
            conversation._id,
            currentUser._id,
            membership.lastseenMessageId
          );

          return {
            ...details,
            unseenCount,
          };
        }),
      )
    ).filter((conversation): conversation is ConversationWithDetails & { unseenCount: number } => conversation !== null);

    return conversations.sort((a, b) => {
      const aTime = a.lastMessage?._creationTime ?? a._creationTime;
      const bTime = b.lastMessage?._creationTime ?? b._creationTime;
      return bTime - aTime;
    });
  },
});

export const get = query({
  args: {
    id: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);

    if (!currentUser) {
      return null;
    }

    const membership = await getConversationMember(ctx, args.id, currentUser._id);

    if (!membership) {
      return null;
    }

    const conversation = await ctx.db.get(args.id);
    if (!conversation) {
      return null;
    }

    return await getConversationWithDetails(ctx, conversation, currentUser._id);
  },
});

export const messages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);

    if (!currentUser) {
      return [];
    }

    const membership = await getConversationMember(ctx, args.conversationId, currentUser._id);

    if (!membership) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .take(100);

    const membersList = await ctx.db
      .query("conversationMembers")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);

        const readBy = [];
        for (const member of membersList) {
          if (member.memberId === message.senderId) continue;

          if (member.lastseenMessageId) {
            if (member.lastseenMessageId === message._id) {
              const user = await ctx.db.get(member.memberId);
              if (user) {
                readBy.push({
                  _id: user._id,
                  username: user.username,
                });
              }
            } else {
              const lastSeenMsg = await ctx.db.get(member.lastseenMessageId);
              if (lastSeenMsg && lastSeenMsg._creationTime >= message._creationTime) {
                const user = await ctx.db.get(member.memberId);
                if (user) {
                  readBy.push({
                    _id: user._id,
                    username: user.username,
                  });
                }
              }
            }
          }
        }

        return {
          ...message,
          isCurrentUser: message.senderId === currentUser._id,
          sender: sender
            ? {
                _id: sender._id,
                username: sender.username,
                imageUrl: sender.imageUrl,
                displayName: sender.displayName,
                customImageUrl: sender.customImageUrl,
              }
            : null,
          readBy,
        };
      }),
    );
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireConversationMember(ctx, args.conversationId, currentUser._id);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new ConvexError("Message cannot be empty");
    }

    const messageId = await ctx.db.insert("messages", {
      senderId: currentUser._id,
      conversationId: args.conversationId,
      type: "text",
      content: [trimmedContent],
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageId: messageId,
    });

    return messageId;
  },
});

export const sendFileMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("file")),
    fileUrl: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireConversationMember(ctx, args.conversationId, currentUser._id);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    const metadata = JSON.stringify({
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
    });

    const messageId = await ctx.db.insert("messages", {
      senderId: currentUser._id,
      conversationId: args.conversationId,
      type: args.type,
      content: [metadata],
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageId: messageId,
    });

    return messageId;
  },
});

export const getReadState = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return null;

    const membership = await getConversationMember(ctx, args.conversationId, currentUser._id);
    if (!membership) return null;

    return {
      lastReadMessageId: membership.lastseenMessageId ?? null,
      lastReadAt: membership.lastReadAt ?? null,
    };
  },
});

export const getUnseenCounts = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("By_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    const results = [];
    for (const membership of memberships) {
      const unseenCount = await getUnseenCount(
        ctx,
        membership.conversationId,
        currentUser._id,
        membership.lastseenMessageId
      );
      results.push({
        conversationId: membership.conversationId,
        unseenCount,
      });
    }

    return results;
  },
});

export const getConversationReadStatus = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const membership = await getConversationMember(ctx, args.conversationId, currentUser._id);
    if (!membership) return null;

    if (!conversation.lastMessageId) {
      return {
        hasBeenRead: false,
        readAt: null,
        lastReadMessageId: null,
      };
    }

    const otherMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const otherMemberRecords = otherMembers.filter((m) => m.memberId !== currentUser._id);

    if (otherMemberRecords.length === 0) {
      return {
        hasBeenRead: false,
        readAt: null,
        lastReadMessageId: null,
      };
    }

    let hasBeenRead = false;
    let readAt: number | null = null;
    let lastReadMessageId: Id<"messages"> | null = null;

    if (!conversation.isGroup) {
      const other = otherMemberRecords[0];
      if (other.lastseenMessageId) {
        lastReadMessageId = other.lastseenMessageId;
        if (other.lastseenMessageId === conversation.lastMessageId) {
          hasBeenRead = true;
          readAt = other.lastReadAt ?? null;
        } else {
          const lastMsg = await ctx.db.get(conversation.lastMessageId);
          const otherSeenMsg = await ctx.db.get(other.lastseenMessageId);
          if (lastMsg && otherSeenMsg && otherSeenMsg._creationTime >= lastMsg._creationTime) {
            hasBeenRead = true;
            readAt = other.lastReadAt ?? null;
          }
        }
      }
    } else {
      const lastMsg = await ctx.db.get(conversation.lastMessageId);
      if (lastMsg) {
        for (const other of otherMemberRecords) {
          if (other.lastseenMessageId) {
            if (other.lastseenMessageId === conversation.lastMessageId) {
              hasBeenRead = true;
              readAt = other.lastReadAt ?? null;
              lastReadMessageId = other.lastseenMessageId;
              break;
            }
            const otherSeenMsg = await ctx.db.get(other.lastseenMessageId);
            if (otherSeenMsg && otherSeenMsg._creationTime >= lastMsg._creationTime) {
              hasBeenRead = true;
              readAt = other.lastReadAt ?? null;
              lastReadMessageId = other.lastseenMessageId;
              break;
            }
          }
        }
      }
    }

    return {
      hasBeenRead,
      readAt,
      lastReadMessageId,
    };
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("By_memberId_conversationId", (q) => q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId))
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this conversation");
    }

    let targetMessageId = args.messageId;

    if (!targetMessageId) {
      const latestMessage = await ctx.db
        .query("messages")
        .withIndex("By_conversationId", (q) => q.eq("conversationId", args.conversationId))
        .order("desc")
        .first();

      if (!latestMessage) {
        return { success: true, updated: false };
      }
      targetMessageId = latestMessage._id;
    }

    if (membership.lastseenMessageId === targetMessageId) {
      return { success: true, updated: false };
    }

    await ctx.db.patch(membership._id, {
      lastseenMessageId: targetMessageId,
      lastReadAt: Date.now(),
    });

    return { success: true, updated: true };
  },
});

export const startCall = mutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.union(v.literal("audio"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireConversationMember(ctx, args.conversationId, currentUser._id);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (conversation.activeCall) {
      throw new ConvexError("A call is already active in this conversation");
    }

    const activeCall = {
      type: args.type,
      startedAt: Date.now(),
      startedBy: currentUser._id,
      participants: [currentUser._id],
    };

    await ctx.db.patch(args.conversationId, {
      activeCall,
    });

    return activeCall;
  },
});

export const joinCall = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireConversationMember(ctx, args.conversationId, currentUser._id);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (!conversation.activeCall) {
      throw new ConvexError("No active call in this conversation");
    }

    const participants = conversation.activeCall.participants;
    if (!participants.includes(currentUser._id)) {
      participants.push(currentUser._id);
      await ctx.db.patch(args.conversationId, {
        activeCall: {
          ...conversation.activeCall,
          participants,
        },
      });
    }

    return conversation.activeCall;
  },
});

export const leaveCall = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.activeCall) {
      return null;
    }

    const participants = conversation.activeCall.participants.filter(
      (p) => p !== currentUser._id
    );

    if (participants.length === 0) {
      await ctx.db.insert("callHistory", {
        conversationId: args.conversationId,
        initiatorId: conversation.activeCall.startedBy,
        type: conversation.activeCall.type,
        startedAt: conversation.activeCall.startedAt,
        endedAt: Date.now(),
        duration: Math.max(0, Math.floor((Date.now() - conversation.activeCall.startedAt) / 1000)),
      });

      await ctx.db.patch(args.conversationId, {
        activeCall: undefined,
      });
    } else {
      await ctx.db.patch(args.conversationId, {
        activeCall: {
          ...conversation.activeCall,
          participants,
        },
      });
    }

    return null;
  },
});

export const endCall = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    await requireConversationMember(ctx, args.conversationId, currentUser._id);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.activeCall) {
      return null;
    }

    const isInitiator = conversation.activeCall.startedBy === currentUser._id;
    let isGroupOwner = false;
    if (conversation.isGroup && conversation.groupId) {
      const group = await ctx.db.get(conversation.groupId);
      isGroupOwner = group?.ownerId === currentUser._id;
    }

    const isOnlyParticipant = conversation.activeCall.participants.length <= 1;

    if (!isInitiator && !isGroupOwner && !isOnlyParticipant) {
      throw new ConvexError("You are not authorized to end this call");
    }

    await ctx.db.insert("callHistory", {
      conversationId: args.conversationId,
      initiatorId: conversation.activeCall.startedBy,
      type: conversation.activeCall.type,
      startedAt: conversation.activeCall.startedAt,
      endedAt: Date.now(),
      duration: Math.max(0, Math.floor((Date.now() - conversation.activeCall.startedAt) / 1000)),
    });

    await ctx.db.patch(args.conversationId, {
      activeCall: undefined,
    });

    return null;
  },
});

