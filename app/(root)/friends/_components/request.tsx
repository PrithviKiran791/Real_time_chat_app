import {Id} from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, User, X } from "lucide-react";

import React from "react";
import { Button } from "@/components/ui/button";
import { useMutationState } from "@/convex/hooks/useMutationState";
import { api } from "@/convex/_generated/api";


type Props = {
    id: Id<"requests">;
    imageUrl: string;
    username: string;
    email: string;
};

const Request = ({id,imageUrl,username,email}:Props) => {
    const {mutate: denyRequest, pending: denyPending} = useMutationState(api.requests.deny);
    const {mutate: acceptRequest, pending: acceptPending} = useMutationState(api.requests.accept);
    return (
        <Card className="w-full p-2 flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
                <Avatar>
                    <AvatarImage src={imageUrl} alt={username} />
                    <AvatarFallback><User className="size-4" /></AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                    <h4 className="truncate font-medium">{username}</h4>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="icon"
                    variant="outline"
                    disabled={denyPending || acceptPending}
                    onClick={() => {
                        acceptRequest({ id }).catch(() => {
                            return;
                        });
                    }}
                    aria-label="Accept friend request"
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="destructive"
                    disabled={denyPending || acceptPending}
                    onClick={() => {
                        denyRequest({ id }).catch(() => {
                            return;
                        });
                    }}
                    aria-label="Deny friend request"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
};

export default Request;