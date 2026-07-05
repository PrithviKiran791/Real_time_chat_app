"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useConversation } from "../../../convex/hooks/useConversation";

type Props = PropsWithChildren<{
    title: string;
    action?: ReactNode;
}>;

const ItemList = ({ children, title, action }: Props) => {
    const { isActive } = useConversation();

    return (
        <Card className={cn("hidden h-full w-full p-2 lg:flex-none lg:w-80", { block: !isActive, "lg:block": isActive })}>
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                {action ?? null}
            </div>
            <div className="flex h-full flex-col gap-2 overflow-y-auto">
                {children}
            </div>
        </Card>
    );
};

export default ItemList;