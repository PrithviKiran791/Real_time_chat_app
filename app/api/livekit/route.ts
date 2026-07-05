import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AccessToken } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
        return new NextResponse("Missing conversationId", { status: 400 });
    }

    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Retrieve Clerk token representing the Convex JWT identity template
        const convexToken = await getToken({ template: "convex" });
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        if (convexToken) {
            convex.setAuth(convexToken);
        }

        // Verify membership by querying the conversation (this query checks access)
        const conversation = await convex.query(api.conversations.get, {
            id: conversationId as any,
        });

        if (!conversation) {
            return new NextResponse("Forbidden - You do not belong to this conversation", { status: 403 });
        }

        const currentUserMember = conversation.members.find(
            (m) => m._id === conversation.currentUserId
        );

        if (!currentUserMember) {
            return new NextResponse("User membership not found", { status: 404 });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
            return new NextResponse("LiveKit server is not configured", { status: 500 });
        }

        // Generate the LiveKit access token
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
        return NextResponse.json({ token });
    } catch (error) {
        console.error("LiveKit token generation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
