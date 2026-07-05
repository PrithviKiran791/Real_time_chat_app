"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutationState } from "@/convex/hooks/useMutationState";
import { LogOut } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
};

export default function LeaveGroupDialog({ open, onOpenChange, groupId }: Props) {
  const router = useRouter();
  const { mutate: leaveGroup, pending } = useMutationState(api.groups.leave);
  const [error, setError] = useState("");

  const handleLeave = async () => {
    setError("");
    try {
      await leaveGroup({ groupId });
      toast.success("Left group successfully");
      onOpenChange(false);
      router.replace("/conversations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave group");
      toast.error("Failed to leave group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this group?
            If you are the owner, ownership will be transferred to another member.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => void handleLeave()}
            className="flex items-center gap-2"
          >
            <LogOut className="size-4" />
            {pending ? "Leaving..." : "Leave Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
