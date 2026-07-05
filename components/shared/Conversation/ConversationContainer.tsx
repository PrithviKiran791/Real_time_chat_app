import { Card } from "@/components/ui/card";
import React from "react";

type Props = {
    children: React.ReactNode;
};

const ConversationContainer = ({children}: Props) => {
    return (
        <Card className="flex h-full w-full flex-col gap-2 p-2">
            {children}
        </Card>
    );
};

export default ConversationContainer;