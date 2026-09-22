import { Card } from "@/components/ui/card";
import React from "react";

type Props = {
    children: React.ReactNode;
};

const ConversationContainer = ({children}: Props) => {
    return (
        <Card className="relative flex h-full w-full flex-col gap-2 overflow-hidden border border-slate-200/80 bg-white/80 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#071A35]/70 dark:text-white p-2">
            {children}
        </Card>
    );
};

export default ConversationContainer;