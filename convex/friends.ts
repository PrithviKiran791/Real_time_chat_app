import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrNull } from "./_utils";

const getFriendship = async (
  ctx: QueryCtx | MutationCtx,
  currentUser: Doc<"users">,
  friendId: Doc<"users">["_id"],
) => {
  const friendship = await ctx.db
    .query("friends")
    .withIndex("By_user1_and_user2", (q) => q.eq("user1", currentUser._id).eq("user2", friendId))
    .unique();

  if (friendship) return friendship;

  return await ctx.db
    .query("friends")
    .withIndex("By_user1_and_user2", (q) => q.eq("user1", friendId).eq("user2", currentUser._id))
    .unique();
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserOrNull(ctx);

    if (!currentUser) {
      return [];
    }

    const user1Friendships = await ctx.db
      .query("friends")
      .withIndex("By_user1", (q) => q.eq("user1", currentUser._id))
      .take(100);

    const user2Friendships = await ctx.db
      .query("friends")
      .withIndex("By_user2", (q) => q.eq("user2", currentUser._id))
      .take(100);

    const friendships = [...user1Friendships, ...user2Friendships];

    return await Promise.all(
      friendships.map(async (friendship) => {
        const friendId = friendship.user1 === currentUser._id ? friendship.user2 : friendship.user1;
        const friend = await ctx.db.get(friendId);

        if (!friend) {
          return null;
        }

        return {
          _id: friend._id,
          username: friend.username,
          email: friend.email,
          imageUrl: friend.imageUrl,
          displayName: friend.displayName,
          customImageUrl: friend.customImageUrl,
          conversationId: friendship.conversationId,
        };
      }),
    ).then((friends) => friends.filter((friend): friend is NonNullable<(typeof friends)[number]> => friend !== null));
  },
});

export const remove = mutation({
  args: {
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const friendship = await getFriendship(ctx, currentUser, args.friendId);

    if (!friendship) {
      throw new ConvexError("Friendship not found");
    }

    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", friendship.conversationId))
      .take(100);

    const messages = await ctx.db
      .query("messages")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", friendship.conversationId))
      .take(100);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(friendship._id);
    await ctx.db.delete(friendship.conversationId);

    return null;
  },
});
