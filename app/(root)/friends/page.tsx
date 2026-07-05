"use client";
import React from "react";
import ItemList from "@/components/shared/item-list/ItemList";
import ConversationFallback from "@/components/shared/Conversation/ConversationFallback";
import AddFriendDialog from "./_components/AddFriendDialog";
import RequestItem from "./_components/request";
import FriendItem from "./_components/FriendItem";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";


const FriendsPage = () => {
    const requests = useQuery(api.requests.get);
    const pendingRequestCount = useQuery(api.requests.getCount);
    const friends = useQuery(api.friends.list);

    let requestContent: React.ReactNode;
    let friendsContent: React.ReactNode;

    if (requests === undefined) {
        requestContent = <p className="py-4 text-center text-sm text-muted-foreground">Loading requests...</p>;
    } else if (requests.length === 0) {
        requestContent = <p className="py-4 text-center text-sm text-muted-foreground">No friend requests</p>;
    } else {
        requestContent = requests.map((request) => (
            <RequestItem
                key={request._id}
                id={request._id}
                imageUrl={request.sender.imageUrl}
                username={request.sender.username}
                email={request.sender.email}
            />
        ));
    }

    if (friends === undefined) {
        friendsContent = <p className="py-4 text-center text-sm text-muted-foreground">Loading friends...</p>;
    } else if (friends.length === 0) {
        friendsContent = <p className="py-4 text-center text-sm text-muted-foreground">No friends yet</p>;
    } else {
        friendsContent = friends.map((friend) => (
            <FriendItem
                key={friend._id}
                id={friend._id}
                imageUrl={friend.imageUrl}
                username={friend.username}
                email={friend.email}
                conversationId={friend.conversationId}
            />
        ));
    }

    return (
        <div className="flex h-full gap-4">
            <ItemList
                title="Friends"
                action={
                    <div className="flex items-center gap-2">
                        {typeof pendingRequestCount === "number" ? (
                            <Badge variant="secondary">{pendingRequestCount} pending</Badge>
                        ) : null}
                        <AddFriendDialog />
                    </div>
                }
            >
                <div className="flex flex-col gap-4">
                    <section className="flex flex-col gap-2">
                        <h3 className="px-1 text-xs font-medium uppercase text-muted-foreground">Friends</h3>
                        {friendsContent}
                    </section>
                    <section className="flex flex-col gap-2">
                        <h3 className="px-1 text-xs font-medium uppercase text-muted-foreground">Requests</h3>
                        {requestContent}
                    </section>
                </div>
            </ItemList>
            <ConversationFallback />
        </div>
    );
};

export default FriendsPage;
