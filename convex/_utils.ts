import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const getUserByClerkId = async ({
  ctx,
  clerkId,
}: {
  ctx: QueryCtx | MutationCtx;
  clerkId: string;
}) => {
  return await ctx.db
    .query("users")
    .withIndex("By_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
};

export const getCurrentUser = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("User is not authenticated");
  }

  const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });

  if (!currentUser) {
    throw new ConvexError("User not found");
  }

  return currentUser;
};

export const getCurrentUserOrNull = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return await getUserByClerkId({ ctx, clerkId: identity.subject });
};
