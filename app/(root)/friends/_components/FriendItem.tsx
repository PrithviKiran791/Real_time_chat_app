"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, User } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConversation } from "@/convex/hooks/useConversation";
import { useMutationState } from "@/convex/hooks/useMutationState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useState } from "react";

type Props = {
    id: Id<"users">;
    imageUrl: string;
    username: string;
    email: string;
    conversationId: Id<"conversations">;
};

const FriendItem = ({ id, imageUrl, username, email, conversationId }: Props) => {
    const router = useRouter();
    const { conversationId: activeConversationId } = useConversation();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const { mutate: removeFriend, pending } = useMutationState(api.friends.remove);

    const handleRemove = async () => {
        setError("");

        try {
            await removeFriend({ friendId: id });
            setOpen(false);

            if (activeConversationId === conversationId) {
                router.replace("/conversations");
            }
        } catch {
            setError("Failed to remove friend. Please try again.");
        }
    };

    return (
        <Card className="flex w-full flex-row items-center justify-between gap-3 p-2">
            <Link href={`/conversations/${conversationId}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar>
                    <AvatarImage src={imageUrl} alt={username} />
                    <AvatarFallback><User className="size-4" /></AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                    <h4 className="truncate font-medium">{username}</h4>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
            </Link>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" aria-label={`Manage ${username}`}>
                        <MoreVertical className="size-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Friend</DialogTitle>
                        <DialogDescription>Are you sure you want to remove this friend?</DialogDescription>
                    </DialogHeader>
                    {error ? <p className="text-xs text-destructive">{error}</p> : null}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={pending}>Cancel</Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" disabled={pending} onClick={() => void handleRemove()}>
                            <Trash2 className="size-4" />
                            Remove Friend
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default FriendItem;
