import React from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const ConversationFallback = () => {
    return ( 
        <Card className="hidden h-full w-full flex-col items-center justify-center gap-3 bg-secondary p-6 text-center text-secondary-foreground lg:flex">
            <div className="flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground">
                <MessageCircle className="size-7" />
            </div>
            <p className="text-sm font-medium">Select a conversation to start chatting.</p>
            </Card>
    );
};

export default ConversationFallback;
