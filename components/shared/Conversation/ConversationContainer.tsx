import React from "react";

type Props = {
    children: React.ReactNode;
};

const ConversationContainer = ({children}: Props) => {
    return (
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden border-0 bg-white dark:bg-[#071A35] lg:border lg:border-slate-200/80 lg:bg-white/80 lg:dark:bg-[#071A35]/70 text-slate-900 shadow-2xl lg:backdrop-blur-xl dark:text-white p-0 lg:p-2 rounded-none lg:rounded-xl dark:lg:border-white/10">
            {children}
        </div>
    );
};

export default ConversationContainer;
