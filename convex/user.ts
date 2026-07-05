import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, getCurrentUserOrNull } from "./_utils";


export const create = internalMutation({
    args: {
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, { username, imageUrl, clerkId, email }) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("By_clerkId", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                username,
                imageUrl,
                email,
                pendingRequestCount: existingUser.pendingRequestCount ?? 0,
            });

            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            username,
            imageUrl,
            clerkId,
            email,
            pendingRequestCount: 0,
        });
    }
})

export const get = internalQuery({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("By_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    }
})

/**
 * Called from the client after sign-in to ensure the user record exists.
 * This is a safe upsert — it uses the verified JWT identity from Convex,
 * never trusting client-supplied IDs.
 * NOTE: Preserves customImageUrl so user-uploaded avatars are not overwritten by Clerk.
 */
export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const existingUser = await ctx.db
            .query("users")
            .withIndex("By_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existingUser) {
            const name = identity.name ?? identity.givenName ?? "Unknown";
            const email = identity.email ?? "";
            const clerkImageUrl = identity.pictureUrl ?? existingUser.imageUrl;

            // Only update imageUrl if the user has NOT set a custom avatar
            const imageUrl = existingUser.customImageUrl ? existingUser.imageUrl : clerkImageUrl;

            const needsUpdate =
                existingUser.username !== name ||
                existingUser.email !== email ||
                existingUser.imageUrl !== imageUrl;

            if (needsUpdate) {
                await ctx.db.patch(existingUser._id, { username: name, email, imageUrl });
            }

            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            username: identity.name ?? identity.givenName ?? "Unknown",
            imageUrl: identity.pictureUrl ?? "",
            clerkId: identity.subject,
            email: identity.email ?? "",
            pendingRequestCount: 0,
        });
    },
});

/**
 * Returns the current authenticated user's full profile.
 * Returns null if unauthenticated (safe for SSR/loading states).
 */
export const getMe = query({
    args: {},
    handler: async (ctx) => {
        return await getCurrentUserOrNull(ctx);
    },
});

/**
 * Updates the current user's profile fields.
 * All args are optional — only provided fields are updated.
 * Empty strings are treated as clearing the field (set to undefined).
 */
export const updateProfile = mutation({
    args: {
        displayName: v.optional(v.string()),
        bio: v.optional(v.string()),
        statusMessage: v.optional(v.string()),
        customImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        await ctx.db.patch(currentUser._id, {
            displayName: args.displayName?.trim() || undefined,
            bio: args.bio?.trim() || undefined,
            statusMessage: args.statusMessage?.trim() || undefined,
            customImageUrl: args.customImageUrl || undefined,
        });
    },
});

/**
 * Returns a user's profile details by their user ID.
 */
export const getUserProfile = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUserOrNull(ctx);
        if (!currentUser) return null;

        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        return {
            _id: user._id,
            username: user.username,
            imageUrl: user.imageUrl,
            displayName: user.displayName,
            customImageUrl: user.customImageUrl,
            bio: user.bio,
            statusMessage: user.statusMessage,
            email: user.email,
        };
    },
});