import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrNull } from "./_utils";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return null;

    const existing = await ctx.db
      .query("typing")
      .withIndex("By_conversationId_userId", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", currentUser._id)
      )
      .unique();

    if (args.isTyping) {
      const expiresAt = Date.now() + 3000; // 3 second TTL
      if (existing) {
        await ctx.db.patch(existing._id, { expiresAt });
      } else {
        await ctx.db.insert("typing", {
          conversationId: args.conversationId,
          userId: currentUser._id,
          expiresAt,
        });
      }
    } else {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }

    return null;
  },
});

export const getTyping = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return [];

    const now = Date.now();
    const records = await ctx.db
      .query("typing")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const activeRecords = records.filter(
      (r) => r.expiresAt > now && r.userId !== currentUser._id
    );

    const users = await Promise.all(
      activeRecords.map(async (r) => {
        const u = await ctx.db.get(r.userId);
        if (!u) return null;
        return {
          _id: u._id,
          username: u.displayName || u.username,
        };
      })
    );

    return users.filter((u): u is { _id: typeof currentUser._id; username: string } => u !== null);
  },
});
