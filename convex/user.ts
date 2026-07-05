import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";


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
            // Update profile in case it changed in Clerk
            const name = identity.name ?? identity.givenName ?? "Unknown";
            const email = identity.email ?? "";
            const imageUrl = identity.pictureUrl ?? existingUser.imageUrl;

            if (
                existingUser.username !== name ||
                existingUser.email !== email ||
                existingUser.imageUrl !== imageUrl
            ) {
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
})