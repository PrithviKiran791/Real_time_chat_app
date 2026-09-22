import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrNull } from "./_utils";



export const paginate = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("By_memberId_conversationId", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId)
      )
      .unique();

    if (!membership) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    // Paginate messages in descending order (newest first)
    const paginated = await ctx.db
      .query("messages")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Fetch conversation members for read receipts
    const membersList = await ctx.db
      .query("conversationMembers")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    // Cache user lookups to avoid N+1 queries
    const userCache = new Map<string, Doc<"users"> | null>();
    const getUser = async (userId: Id<"users">) => {
      const key = userId.toString();
      if (!userCache.has(key)) {
        userCache.set(key, await ctx.db.get(userId));
      }
      return userCache.get(key) ?? null;
    };

    const enrichedPage = await Promise.all(
      paginated.page.map(async (message) => {
        const sender = await getUser(message.senderId);

        // Parse legacy or structured attachments for backward compatibility
        let attachment = message.attachment;
        if (!attachment && (message.type === "image" || message.type === "video" || message.type === "file")) {
          try {
            if (message.content && message.content[0]) {
              const parsed = JSON.parse(message.content[0]);
              if (parsed.fileUrl) {
                attachment = {
                  url: parsed.fileUrl,
                  name: parsed.fileName ?? "attachment",
                  size: parsed.fileSize ?? 0,
                  mimeType: parsed.mimeType ?? "",
                };
              }
            }
          } catch {
            // content is not JSON, ignore
          }
        }

        // Fetch reply context if present
        let replyToDetails: {
          _id: Id<"messages">;
          text: string;
          senderName: string;
          type: string;
        } | null = null;

        if (message.replyTo) {
          const repliedMsg = await ctx.db.get(message.replyTo);
          if (repliedMsg) {
            const replySender = await getUser(repliedMsg.senderId);
            let replyText = repliedMsg.content?.[0] ?? "";
            if (repliedMsg.type !== "text") {
              replyText = repliedMsg.type === "image" ? "📷 Image" : repliedMsg.type === "video" ? "📹 Video" : "📎 File";
            }
            replyToDetails = {
              _id: repliedMsg._id,
              text: replyText,
              senderName: replySender?.displayName || replySender?.username || "Unknown",
              type: repliedMsg.type,
            };
          }
        }

        // Calculate readBy receipts
        const readBy: Array<{ _id: Id<"users">; username: string }> = [];
        for (const member of membersList) {
          if (member.memberId === message.senderId) continue;

          if (member.lastseenMessageId) {
            if (member.lastseenMessageId === message._id) {
              const u = await getUser(member.memberId);
              if (u) readBy.push({ _id: u._id, username: u.username });
            } else {
              const lastSeenMsg = await ctx.db.get(member.lastseenMessageId);
              if (lastSeenMsg && lastSeenMsg._creationTime >= message._creationTime) {
                const u = await getUser(member.memberId);
                if (u) readBy.push({ _id: u._id, username: u.username });
              }
            }
          }
        }

        // Enrich reactions with user info
        const reactionsWithDetails = (message.reactions ?? []).map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
          isCurrentUser: r.userId === currentUser._id,
        }));

        return {
          ...message,
          attachment,
          replyToDetails,
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
          reactions: reactionsWithDetails,
        };
      })
    );

    return {
      ...paginated,
      page: enrichedPage,
    };
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal("file"))),
    attachment: v.optional(
      v.object({
        url: v.string(),
        name: v.string(),
        size: v.number(),
        mimeType: v.string(),
      })
    ),
    replyTo: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("By_memberId_conversationId", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this conversation");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    const messageType = args.type ?? (args.attachment ? (args.attachment.mimeType.startsWith("image/") ? "image" : args.attachment.mimeType.startsWith("video/") ? "video" : "file") : "text");
    const rawContent = args.content.trim();

    if (messageType === "text" && !rawContent) {
      throw new ConvexError("Message text cannot be empty");
    }

    // Keep backward-compatible content string
    let contentToStore = [rawContent];
    if (args.attachment) {
      const meta = JSON.stringify({
        fileUrl: args.attachment.url,
        fileName: args.attachment.name,
        fileSize: args.attachment.size,
        mimeType: args.attachment.mimeType,
      });
      contentToStore = [meta];
    }

    const messageId = await ctx.db.insert("messages", {
      senderId: currentUser._id,
      conversationId: args.conversationId,
      type: messageType,
      content: contentToStore,
      attachment: args.attachment,
      replyTo: args.replyTo,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageId: messageId,
    });

    // Automatically update sender's read marker to their newly sent message
    await ctx.db.patch(membership._id, {
      lastseenMessageId: messageId,
      lastReadAt: Date.now(),
    });

    return messageId;
  },
});

export const edit = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new ConvexError("Message not found");
    }

    if (message.senderId !== currentUser._id) {
      throw new ConvexError("You can only edit your own messages");
    }

    if (message.type !== "text") {
      throw new ConvexError("Only text messages can be edited");
    }

    if (message.deletedAt) {
      throw new ConvexError("Cannot edit a deleted message");
    }

    const trimmed = args.content.trim();
    if (!trimmed) {
      throw new ConvexError("Message cannot be empty");
    }

    await ctx.db.patch(args.messageId, {
      content: [trimmed],
      isEdited: true,
    });

    return { success: true };
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new ConvexError("Message not found");
    }

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    let isGroupOwner = false;
    if (conversation.isGroup && conversation.groupId) {
      const group = await ctx.db.get(conversation.groupId);
      isGroupOwner = group?.ownerId === currentUser._id;
    }

    if (message.senderId !== currentUser._id && !isGroupOwner) {
      throw new ConvexError("You are not authorized to delete this message");
    }

    // Soft delete to maintain thread integrity
    await ctx.db.patch(args.messageId, {
      content: ["This message was deleted"],
      deletedAt: Date.now(),
      attachment: undefined,
    });

    return { success: true };
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new ConvexError("Message not found");
    }

    // Verify user is in conversation
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("By_memberId_conversationId", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", message.conversationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You do not have access to this conversation");
    }

    const existingReactions = message.reactions ?? [];
    const index = existingReactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === currentUser._id
    );

    let updatedReactions;
    if (index >= 0) {
      // Remove reaction
      updatedReactions = existingReactions.filter((_, i) => i !== index);
    } else {
      // Add reaction
      updatedReactions = [...existingReactions, { emoji: args.emoji, userId: currentUser._id }];
    }

    await ctx.db.patch(args.messageId, {
      reactions: updatedReactions,
    });

    return { success: true };
  },
});
