import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";

type ClerkWebhookEvent = {
    type: string;
    data: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        profile_image_url: string;
        email_addresses: Array<{ email_address: string }>;
    };
};

const http = httpRouter();

const handlerClerkWebhook = httpAction(async (ctx, req) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
        return new Response("Missing webhook secret", { status: 500 });
    }

    const payload = await req.text();
    const headers = {
        "svix-id": req.headers.get("svix-id") || "",
        "svix-timestamp": req.headers.get("svix-timestamp") || "",
        "svix-signature": req.headers.get("svix-signature") || "",
    };

    let event: ClerkWebhookEvent;

    try {
        event = new Webhook(secret).verify(payload, headers) as ClerkWebhookEvent;
    } catch (error) {
        console.error("Error validating webhook payload:", error);
        return new Response("Invalid webhook payload", { status: 400 });
    }

    switch (event.type) {
        case "user.created":
        case "user.updated": {
            const username = `${event.data.first_name ?? ""} ${event.data.last_name ?? ""}`.trim() || "Unknown";
            const email = event.data.email_addresses[0]?.email_address || "";

            await ctx.runMutation(internal.user.create, {
                username,
                imageUrl: event.data.profile_image_url,
                clerkId: event.data.id,
                email,
            });
            break;
        }
        default:
            console.log("Clerk event webhook not supported", event.type);
    }

    return new Response(null, { status: 200 });
});

http.route({
    path: "/clerk-users-webhook",
    method: "POST",
    handler: handlerClerkWebhook,
});

export default http;