"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutationState } from "@/convex/hooks/useMutationState";
import { api } from "@/convex/_generated/api";


const addFriendSchema = z.object({
    email: z.string().min(1, { message: "This can't be empty" }).email("Please enter a valid email address"),
});

const AddFriendDialog = () => {
    const { mutate: createRequest, pending } = useMutationState(api.requests.create);
    const [open, setOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof addFriendSchema>>({
        resolver: zodResolver(addFriendSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleSubmit = async (values: z.infer<typeof addFriendSchema>) => {
        setSubmitError(null);

        try {
            await createRequest({ email: values.email });
            form.reset();
            setOpen(false);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Unexpected error occurred");
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="outline">
                            <UserPlus />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add Friend</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                    <DialogDescription>
                        Send a friend request to another user using their email address.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input id="email" {...form.register("email")} placeholder="friend@example.com" />
                        {form.formState.errors.email ? (
                            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                        ) : null}
                    </div>
                    {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
                    <Button type="submit" disabled={pending}>
                        {pending ? "Sending..." : "Send Request"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddFriendDialog;