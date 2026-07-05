"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutationState } from "@/convex/hooks/useMutationState";
import { Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: Id<"groups">;
};

export default function DeleteGroupDialog({ open, onOpenChange, groupId }: Props) {
  const router = useRouter();
  const { mutate: deleteGroup, pending } = useMutationState(api.groups.deleteGroup);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    try {
      await deleteGroup({ groupId });
      toast.success("Group deleted successfully");
      onOpenChange(false);
      router.replace("/conversations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
      toast.error("Failed to delete group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this group? This action is permanent and will delete all messages, memberships, and conversations.
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
            onClick={() => void handleDelete()}
            className="flex items-center gap-2"
          >
            <Trash2 className="size-4" />
            {pending ? "Deleting..." : "Delete Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
