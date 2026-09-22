import { Card } from "@/components/ui/card";
import React from "react";

type Props = {
    children: React.ReactNode;
};

const ConversationContainer = ({children}: Props) => {
    return (
        <Card className="relative flex h-full w-full flex-col overflow-hidden border-0 lg:border border-slate-200/80 bg-white dark:bg-[#071A35] lg:bg-white/80 lg:dark:bg-[#071A35]/70 text-slate-900 shadow-2xl lg:backdrop-blur-xl dark:border-white/10 dark:text-white p-0 lg:p-2 rounded-none lg:rounded-xl">
            {children}
        </Card>
    );
};

export default ConversationContainer;