import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrNull } from "./_utils";

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return null;

    await ctx.db.patch(currentUser._id, {
      isOnline: true,
      lastSeenAt: Date.now(),
    });
    return null;
  },
});

export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return null;

    await ctx.db.patch(currentUser._id, {
      isOnline: false,
      lastSeenAt: Date.now(),
    });
    return null;
  },
});

export const getUserPresence = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const now = Date.now();
    const lastSeen = user.lastSeenAt ?? null;
    // Consider online if flag is true and lastSeen within last 50 seconds
    const isOnline = !!(user.isOnline && lastSeen && now - lastSeen < 50000);

    return {
      userId: user._id,
      isOnline,
      lastSeenAt: lastSeen,
    };
  },
});

export const getMultiplePresence = query({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const result: Record<string, { isOnline: boolean; lastSeenAt: number | null }> = {};

    await Promise.all(
      args.userIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        if (user) {
          const lastSeen = user.lastSeenAt ?? null;
          const isOnline = !!(user.isOnline && lastSeen && now - lastSeen < 50000);
          result[userId] = { isOnline, lastSeenAt: lastSeen };
        }
      })
    );

    return result;
  },
});
