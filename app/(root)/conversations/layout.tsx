import React from "react";
import ItemList from "@/components/shared/item-list/ItemList";
import ConversationList from "@/components/shared/Conversation/ConversationList";
import CreateGroupDialog from "@/components/shared/Conversation/CreateGroupDialog";

type Props = {
    children: React.ReactNode;
};

const ConversationsLayout = ({children}: Props) => {
    return (
        <div className="flex h-full gap-4">
            <ItemList title="Conversations" action={<CreateGroupDialog />}>
                <ConversationList />
            </ItemList>
            {children}
        </div>
    );
};

export default ConversationsLayout;
