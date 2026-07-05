import React from "react";
import ConversationContainer from "@/components/shared/Conversation/ConversationContainer";
import ActiveConversation from "@/components/shared/Conversation/ActiveConversation";

const ConversationsPage = () => {
    return (
        <ConversationContainer>
            <ActiveConversation />
        </ConversationContainer>
    );
};
export default ConversationsPage;
