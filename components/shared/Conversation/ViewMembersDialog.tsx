"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfileDialog } from "@/components/shared/profile/UserProfileDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
};

export default function ViewMembersDialog({ open, onOpenChange, groupId }: Props) {
  const groupDetails = useQuery(api.groups.get, { groupId });
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | undefined>(undefined);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Group Members</DialogTitle>
            <DialogDescription>
              List of users currently in this group.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4 max-h-[300px] overflow-y-auto pr-1">
            {groupDetails === undefined ? (
              <p className="text-center text-xs text-muted-foreground py-4">Loading members...</p>
            ) : !groupDetails ? (
              <p className="text-center text-xs text-muted-foreground py-4">Failed to load group details.</p>
            ) : (
              groupDetails.members.map((member) => (
                <div key={member._id} className="flex items-center justify-between gap-3 p-1">
                  <div 
                    className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedUserId(member._id)}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={member.customImageUrl ?? member.imageUrl} alt={member.displayName ?? member.username} />
                      <AvatarFallback>{(member.displayName ?? member.username)[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{member.displayName ?? member.username}</span>
                      <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                    </div>
                  </div>
                  {member.role === "OWNER" ? (
                    <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                      Owner
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                      Member
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UserProfileDialog
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedUserId(undefined);
        }}
      />
    </>
  );
}
