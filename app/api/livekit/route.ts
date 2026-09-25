import { NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AccessToken } from "livekit-server-sdk";

type ErrorCode =
  | "MISSING_CONVERSATION_ID"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "MISCONFIGURED"
  | "INTERNAL";

function jsonError(message: string, status: number, code: ErrorCode) {
  return NextResponse.json({ error: message, code }, { status });
}

function isValidConversationId(value: string): boolean {
  if (!value || value === "undefined" || value === "null") return false;
  return /^[a-z0-9]+$/i.test(value) && value.length >= 16;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId")?.trim() ?? "";

  console.info("[LiveKit] request received", { conversationId: conversationId || "(empty)" });

  if (!isValidConversationId(conversationId)) {
    console.info("[LiveKit] token generation failed", {
      conversationId: conversationId || "(empty)",
      category: "MISSING_CONVERSATION_ID",
    });
    return jsonError("A valid conversation is required to start a call.", 400, "MISSING_CONVERSATION_ID");
  }

  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      console.info("[LiveKit] token generation failed", {
        conversationId,
        category: "UNAUTHENTICATED",
      });
      return jsonError("You need to sign in to start a call.", 401, "UNAUTHENTICATED");
    }

    console.info("[LiveKit] authenticated user resolved", { conversationId, userId });

    const convexToken = await getToken({ template: "convex" });
    if (!convexToken) {
      console.info("[LiveKit] token generation failed", {
        conversationId,
        userId,
        category: "UNAUTHENTICATED",
      });
      return jsonError("You need to sign in to start a call.", 401, "UNAUTHENTICATED");
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("[LiveKit] token generation failed", {
        conversationId,
        userId,
        category: "MISCONFIGURED",
        reason: "missing_convex_url",
      });
      return jsonError(
        "Calling is temporarily unavailable. Please try again later.",
        503,
        "MISCONFIGURED"
      );
    }

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(convexToken);

    const conversation = await convex.query(api.conversations.get, {
      id: conversationId as Id<"conversations">,
    });

    if (!conversation) {
      console.info("[LiveKit] token generation failed", {
        conversationId,
        userId,
        category: "FORBIDDEN",
      });
      return jsonError("You are not a member of this conversation.", 403, "FORBIDDEN");
    }

    const currentUserMember = conversation.members.find((m) => m._id === conversation.currentUserId);

    if (!currentUserMember) {
      console.info("[LiveKit] token generation failed", {
        conversationId,
        userId,
        category: "NOT_FOUND",
      });
      return jsonError("You are not a member of this conversation.", 403, "FORBIDDEN");
    }

    console.info("[LiveKit] conversation membership verified", {
      conversationId,
      userId,
    });

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("[LiveKit] token generation failed", {
        conversationId,
        userId,
        category: "MISCONFIGURED",
        reason: "missing_livekit_credentials",
      });
      return jsonError(
        "Calling is temporarily unavailable. Please try again later.",
        503,
        "MISCONFIGURED"
      );
    }

    console.info("[LiveKit] generating access token", { conversationId, userId });

    const at = new AccessToken(apiKey, apiSecret, {
      identity: currentUserMember._id,
      name: currentUserMember.username,
      metadata: JSON.stringify({
        username: currentUserMember.username,
        imageUrl: currentUserMember.imageUrl,
      }),
    });

    at.addGrant({
      room: conversationId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    console.info("[LiveKit] token generated successfully", { conversationId, userId });
    return NextResponse.json({ token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[LiveKit] token generation failed", {
      conversationId,
      category: "INTERNAL",
      reason: message,
    });
    return jsonError(
      "Calling is temporarily unavailable. Please try again later.",
      500,
      "INTERNAL"
    );
  }
}
