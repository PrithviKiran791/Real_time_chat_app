import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { type Doc } from "./_generated/dataModel";
import { getUserByClerkId } from "./_utils";

async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("User is not authenticated");
  }

  const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });

  if (!currentUser) {
    throw new ConvexError("User not found");
  }

  return currentUser;
}

async function getRequestWithSender(ctx: QueryCtx, request: Doc<"requests">) {
  const sender = await ctx.db.get(request.senderId);

  if (!sender) {
    throw new ConvexError("Sender not found");
  }

  return {
    ...request,
    sender: {
      _id: sender._id,
      username: sender.username,
      imageUrl: sender.imageUrl,
      email: sender.email,
      displayName: sender.displayName,
      customImageUrl: sender.customImageUrl,
    },
  };
}

export const create = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const receiver = await ctx.db.query("users").withIndex("By_email", (q) => q.eq("email", args.email)).unique();

    if (!receiver) {
      throw new ConvexError("Receiver not found");
    }

    if (receiver._id === currentUser._id) {
      throw new ConvexError("You cannot send a request to yourself");
    }

    const requestAlreadySent = await ctx.db
      .query("requests")
      .withIndex("By_senderId_and_receiverId", (q) => q.eq("senderId", currentUser._id).eq("receiverId", receiver._id))
      .unique();

    const requestAlreadyReceived = await ctx.db
      .query("requests")
      .withIndex("By_senderId_and_receiverId", (q) => q.eq("senderId", receiver._id).eq("receiverId", currentUser._id))
      .unique();

    if (requestAlreadySent || requestAlreadyReceived) {
      throw new ConvexError("A friend request already exists between these users");
    }

    const existingFriend = await ctx.db
      .query("friends")
      .withIndex("By_user1_and_user2", (q) => q.eq("user1", currentUser._id).eq("user2", receiver._id))
      .unique();

    const existingFriendReverse = await ctx.db
      .query("friends")
      .withIndex("By_user1_and_user2", (q) => q.eq("user1", receiver._id).eq("user2", currentUser._id))
      .unique();

    if (existingFriend || existingFriendReverse) {
      throw new ConvexError("You are already friends with this user");
    }

    const requestId = await ctx.db.insert("requests", {
      senderId: currentUser._id,
      receiverId: receiver._id,
      status: "pending",
    });

    await ctx.db.patch(receiver._id, {
      pendingRequestCount: (receiver.pendingRequestCount ?? 0) + 1,
    });

    return requestId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser) return [];

    const requests = await ctx.db
      .query("requests")
      .withIndex("By_receiverId", (q) => q.eq("receiverId", currentUser._id))
      .take(100);

    return await Promise.all(requests.map((request) => getRequestWithSender(ctx, request)));
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser) return 0;

    if (typeof currentUser.pendingRequestCount === "number") {
      return currentUser.pendingRequestCount;
    }

    const requests = await ctx.db
      .query("requests")
      .withIndex("By_receiverId", (q) => q.eq("receiverId", currentUser._id))
      .take(100);

    return requests.length;
  },
});

export const deny = mutation({
  args: {
    id: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const request = await ctx.db.get(args.id);

    if (!request || request.receiverId !== currentUser._id) {
      throw new ConvexError("There was an error denying this request");
    }

    await ctx.db.delete(request._id);
    await ctx.db.patch(currentUser._id, {
      pendingRequestCount: Math.max((currentUser.pendingRequestCount ?? 1) - 1, 0),
    });

    return null;
  },
});

export const accept = mutation({
  args: {
    id: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const request = await ctx.db.get(args.id);

    if (!request || request.receiverId !== currentUser._id) {
      throw new ConvexError("There was an error accepting this request");
    }

    const existingFriend = await ctx.db
      .query("friends")
      .withIndex("By_user1_and_user2", (q) => q.eq("user1", request.senderId).eq("user2", request.receiverId))
      .unique();

    const existingFriendReverse = await ctx.db
      .query("friends")
      .withIndex("By_user1_and_user2", (q) => q.eq("user1", request.receiverId).eq("user2", request.senderId))
      .unique();

    if (existingFriend || existingFriendReverse) {
      throw new ConvexError("You are already friends with this user");
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
    });

    await ctx.db.insert("friends", {
      user1: request.senderId,
      user2: request.receiverId,
      conversationId,
    });

    await ctx.db.insert("conversationMembers", {
      memberId: request.senderId,
      conversationId,
    });

    await ctx.db.insert("conversationMembers", {
      memberId: request.receiverId,
      conversationId,
    });

    await ctx.db.delete(request._id);
    await ctx.db.patch(currentUser._id, {
      pendingRequestCount: Math.max((currentUser.pendingRequestCount ?? 1) - 1, 0),
    });

    return conversationId;
  },
});