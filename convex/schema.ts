import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    email: v.string(),
    pendingRequestCount: v.optional(v.number()),
    // Profile customization fields
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    statusMessage: v.optional(v.string()),
    customImageUrl: v.optional(v.string()), // user-uploaded avatar (overrides Clerk imageUrl)
  })
    .index("By_email", ["email"])
    .index("By_clerkId", ["clerkId"]),
  requests: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    status: v.string(),
  })
    .index("By_senderId", ["senderId"])
    .index("By_receiverId", ["receiverId"])
    .index("By_senderId_and_receiverId", ["senderId", "receiverId"]),
  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    conversationId: v.id("conversations"),
  })
    .index("By_user1", ["user1"])
    .index("By_user2", ["user2"])
    .index("By_user1_and_user2", ["user1", "user2"])
    .index("By_conversationId", ["conversationId"]),
  conversations: defineTable({
    name: v.optional(v.string()),
    isGroup: v.boolean(),
    lastMessageId: v.optional(v.id("messages")),
    conversationType: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
    activeCall: v.optional(
      v.object({
        type: v.union(v.literal("audio"), v.literal("video")),
        startedAt: v.number(),
        startedBy: v.id("users"),
        participants: v.array(v.id("users")),
      })
    ),
  }).index("By_groupId", ["groupId"]),
  conversationMembers: defineTable({
    memberId: v.id("users"),
    conversationId: v.id("conversations"),
    lastseenMessageId: v.optional(v.id("messages")),
    lastReadAt: v.optional(v.number()),
  })
    .index("By_memberId", ["memberId"])
    .index("By_conversationId", ["conversationId"])
    .index("By_memberId_conversationId", ["memberId", "conversationId"]),
  messages: defineTable({
    senderId: v.id("users"),
    conversationId: v.id("conversations"),
    type: v.string(),
    content: v.array(v.string()),
  })
    .index("By_conversationId", ["conversationId"])
    .index("By_senderId", ["senderId"])
    .index("By_conversationId_senderId", ["conversationId", "senderId"])
    .index("By_conversationId_type", ["conversationId", "type"]),
  groups: defineTable({
    name: v.string(),
    imageUrl: v.optional(v.string()),
    ownerId: v.id("users"),
    updatedAt: v.number(),
  }),
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.string(), // "OWNER" | "MEMBER"
  })
    .index("By_groupId", ["groupId"])
    .index("By_userId", ["userId"])
    .index("By_groupId_userId", ["groupId", "userId"]),
  callHistory: defineTable({
    conversationId: v.id("conversations"),
    initiatorId: v.id("users"),
    type: v.union(v.literal("audio"), v.literal("video")),
    startedAt: v.number(),
    endedAt: v.number(),
    duration: v.number(),
  }).index("By_conversationId", ["conversationId"]),
});