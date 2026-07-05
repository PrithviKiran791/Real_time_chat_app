"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

export const useConversation = () => {
    const params = useParams<Record<string, string | string[] | undefined>>();

    const conversationId = useMemo(() => {
        const conversationIdValue = params?.conversationId;

        return typeof conversationIdValue === "string" ? conversationIdValue : "";
    }, [params?.conversationId]);

    const isActive = useMemo(() => Boolean(conversationId), [conversationId]);

    return {
        isActive,
        conversationId,
    };
};