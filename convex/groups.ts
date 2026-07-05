import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrNull } from "./_utils";

export const create = mutation({
  args: {
    name: v.string(),
    members: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const name = args.name.trim();
    if (name.length < 3) {
      throw new ConvexError("Group name must be at least 3 characters");
    }
    if (name.length > 50) {
      throw new ConvexError("Group name must be at most 50 characters");
    }

    if (args.members.length < 2) {
      throw new ConvexError("You must select at least 2 friends to create a group");
    }

    // Check for duplicates
    const uniqueMembers = Array.from(new Set(args.members));
    if (uniqueMembers.length !== args.members.length) {
      throw new ConvexError("Duplicate members selected");
    }

    // Verify creator is not in selected members (they are added automatically)
    if (args.members.includes(currentUser._id)) {
      throw new ConvexError("You cannot select yourself as a member");
    }

    // Verify all members exist
    for (const memberId of args.members) {
      const member = await ctx.db.get(memberId);
      if (!member) {
        throw new ConvexError("One or more selected users do not exist");
      }
    }

    const now = Date.now();

    // Create the group document
    const groupId = await ctx.db.insert("groups", {
      name,
      ownerId: currentUser._id,
      updatedAt: now,
    });

    // Create group memberships
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: currentUser._id,
      role: "OWNER",
    });

    for (const memberId of args.members) {
      await ctx.db.insert("groupMembers", {
        groupId,
        userId: memberId,
        role: "MEMBER",
      });
    }

    // Create the conversation document
    const conversationId = await ctx.db.insert("conversations", {
      name,
      isGroup: true,
      conversationType: "group",
      groupId,
    });

    // Create conversation memberships
    await ctx.db.insert("conversationMembers", {
      memberId: currentUser._id,
      conversationId,
    });

    for (const memberId of args.members) {
      await ctx.db.insert("conversationMembers", {
        memberId: memberId,
        conversationId,
      });
    }

    return conversationId;
  },
});

export const get = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return null;

    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    // Check authorization: user must belong to group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("By_groupId_userId", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .unique();

    if (!membership) return null;

    const owner = await ctx.db.get(group.ownerId);

    const memberRecords = await ctx.db
      .query("groupMembers")
      .withIndex("By_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    const members = await Promise.all(
      memberRecords.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        return {
          _id: record.userId,
          username: user?.username ?? "Unknown User",
          imageUrl: user?.imageUrl ?? "",
          email: user?.email ?? "",
          displayName: user?.displayName,
          customImageUrl: user?.customImageUrl,
          role: record.role,
        };
      })
    );

    return {
      _id: group._id,
      name: group.name,
      imageUrl: group.imageUrl,
      ownerId: group.ownerId,
      owner: owner
        ? {
            _id: owner._id,
            username: owner.username,
            imageUrl: owner.imageUrl,
            email: owner.email,
            displayName: owner.displayName,
            customImageUrl: owner.customImageUrl,
          }
        : null,
      members,
      memberCount: members.length,
    };
  },
});

export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserOrNull(ctx);
    if (!currentUser) return [];

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("By_userId", (q) => q.eq("userId", currentUser._id))
      .collect();

    const results = [];

    for (const membership of memberships) {
      const group = await ctx.db.get(membership.groupId);
      if (!group) continue;

      const conversation = await ctx.db
        .query("conversations")
        .withIndex("By_groupId", (q) => q.eq("groupId", group._id))
        .unique();

      if (!conversation) continue;

      const allMembers = await ctx.db
        .query("groupMembers")
        .withIndex("By_groupId", (q) => q.eq("groupId", group._id))
        .collect();

      const lastMessage = conversation.lastMessageId ? await ctx.db.get(conversation.lastMessageId) : null;
      const lastActivity = lastMessage?._creationTime ?? group.updatedAt;

      results.push({
        _id: group._id,
        name: group.name,
        imageUrl: group.imageUrl,
        ownerId: group.ownerId,
        memberCount: allMembers.length,
        conversationId: conversation._id,
        latestMessage: lastMessage
          ? {
              _id: lastMessage._id,
              senderId: lastMessage.senderId,
              content: lastMessage.content,
              _creationTime: lastMessage._creationTime,
            }
          : null,
        lastActivity,
      });
    }

    return results.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

export const leave = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new ConvexError("Group not found");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("By_groupId_userId", (q) => q.eq("groupId", args.groupId).eq("userId", currentUser._id))
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this group");
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("By_groupId", (q) => q.eq("groupId", args.groupId))
      .unique();

    if (!conversation) {
      throw new ConvexError("Group conversation not found");
    }

    const conversationMember = await ctx.db
      .query("conversationMembers")
      .withIndex("By_memberId_conversationId", (q) => q.eq("memberId", currentUser._id).eq("conversationId", conversation._id))
      .unique();

    // Check if owner
    const isOwner = membership.role === "OWNER" || group.ownerId === currentUser._id;

    const allMembers = await ctx.db
      .query("groupMembers")
      .withIndex("By_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    const otherMembers = allMembers.filter((m) => m.userId !== currentUser._id);

    if (otherMembers.length > 0) {
      if (isOwner) {
        // Transfer ownership to the first available member
        const newOwner = otherMembers[0];
        await ctx.db.patch(newOwner._id, {
          role: "OWNER",
        });
        await ctx.db.patch(group._id, {
          ownerId: newOwner.userId,
          updatedAt: Date.now(),
        });
      }

      // Remove leaving member from group and conversation
      await ctx.db.delete(membership._id);
      if (conversationMember) {
        await ctx.db.delete(conversationMember._id);
      }
    } else {
      // Last member is leaving - delete group, conversation, messages
      await ctx.db.delete(membership._id);
      if (conversationMember) {
        await ctx.db.delete(conversationMember._id);
      }

      // Delete messages
      const messages = await ctx.db
        .query("messages")
        .withIndex("By_conversationId", (q) => q.eq("conversationId", conversation._id))
        .collect();
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      // Delete conversation
      await ctx.db.delete(conversation._id);

      // Delete group
      await ctx.db.delete(group._id);
    }

    return { success: true };
  },
});

export const deleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new ConvexError("Group not found");
    }

    if (group.ownerId !== currentUser._id) {
      throw new ConvexError("Only the group owner can delete this group");
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("By_groupId", (q) => q.eq("groupId", args.groupId))
      .unique();

    if (!conversation) {
      throw new ConvexError("Group conversation not found");
    }

    // Delete group members
    const groupMemberships = await ctx.db
      .query("groupMembers")
      .withIndex("By_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();
    for (const member of groupMemberships) {
      await ctx.db.delete(member._id);
    }

    // Delete conversation members
    const conversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", conversation._id))
      .collect();
    for (const member of conversationMemberships) {
      await ctx.db.delete(member._id);
    }

    // Delete messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("By_conversationId", (q) => q.eq("conversationId", conversation._id))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete conversation
    await ctx.db.delete(conversation._id);

    // Delete group
    await ctx.db.delete(group._id);

    return { success: true };
  },
});
