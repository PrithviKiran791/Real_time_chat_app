"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Users, X, Check } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutationState } from "@/convex/hooks/useMutationState";

export default function CreateGroupDialog() {
  const router = useRouter();
  const { mutate: createGroup, pending } = useMutationState(api.groups.create);
  const friends = useQuery(api.friends.list);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Id<"users">[]>([]);

  const filteredFriends = friends?.filter((friend) => {
    const term = search.toLowerCase();
    return (
      friend.username.toLowerCase().includes(term) ||
      friend.email.toLowerCase().includes(term)
    );
  }) ?? [];

  const handleSelect = (id: Id<"users">) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleRemoveSelected = (id: Id<"users">) => {
    setSelected(selected.filter((item) => item !== id));
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      toast.error("Group name must be at least 3 characters");
      return;
    }
    if (trimmedName.length > 50) {
      toast.error("Group name must be at most 50 characters");
      return;
    }
    if (selected.length < 2) {
      toast.error("You must select at least 2 friends");
      return;
    }

    try {
      const conversationId = await createGroup({
        name: trimmedName,
        members: selected,
      });

      toast.success("Group created successfully!");
      setOpen(false);
      setName("");
      setSelected([]);
      setSearch("");
      router.push(`/conversations/${conversationId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create group");
    }
  };

  const nameError = name.length > 0 && name.trim().length < 3 ? "Name must be at least 3 characters" : name.length > 50 ? "Name must be at most 50 characters" : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" aria-label="Create group">
              <Users className="size-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create Group</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="flex flex-col max-h-[85vh] sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Create a group chat with at least 2 of your friends.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 overflow-y-auto min-h-0 flex-1 pr-1">
          {/* Group Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="group-name" className="text-sm font-medium">
              Group Name
            </label>
            <Input
              id="group-name"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
            {nameError ? (
              <p className="text-xs text-destructive">{nameError}</p>
            ) : null}
          </div>

          {/* Selected Members List */}
          {selected.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Selected Members ({selected.length})</span>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto border rounded-lg p-2 bg-muted/20">
                {selected.map((id) => {
                  const friend = friends?.find((f) => f._id === id);
                  if (!friend) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-xs rounded-full px-2 py-1"
                    >
                      <Avatar className="size-4">
                        <AvatarImage src={friend.imageUrl} alt={friend.username} />
                        <AvatarFallback>{friend.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="max-w-[80px] truncate">{friend.username}</span>
                      <button
                        onClick={() => handleRemoveSelected(id)}
                        disabled={pending}
                        className="text-muted-foreground hover:text-foreground outline-none cursor-pointer"
                        type="button"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Search Friends */}
          <div className="flex flex-col gap-2">
            <label htmlFor="friend-search" className="text-sm font-medium">
              Add Friends
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="friend-search"
                placeholder="Search by username or email"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={pending}
              />
            </div>
          </div>

          {/* Friends List to Select */}
          <div className="flex flex-col gap-2 min-h-0 flex-1">
            <span className="text-sm font-medium">Friends</span>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
              {friends === undefined ? (
                <p className="text-center text-xs text-muted-foreground py-4">Loading friends...</p>
              ) : filteredFriends.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">
                  {search ? "No friends match search" : "No friends found to add"}
                </p>
              ) : (
                filteredFriends.map((friend) => {
                  const isSelected = selected.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() => !pending && handleSelect(friend._id)}
                      className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="size-8">
                          <AvatarImage src={friend.imageUrl} alt={friend.username} />
                          <AvatarFallback>{friend.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{friend.username}</span>
                          <span className="text-xs text-muted-foreground truncate">{friend.email}</span>
                        </div>
                      </div>
                      <div
                        className={`size-5 border rounded flex items-center justify-center transition-colors ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"
                        }`}
                      >
                        {isSelected ? <Check className="size-3" /> : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleCreate()}
            disabled={pending || name.trim().length < 3 || selected.length < 2 || name.length > 50}
          >
            {pending ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
