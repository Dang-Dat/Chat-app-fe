import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import InfiniteScroll from "react-infinite-scroll-component"

const ChatWindowBody = () => {

    const {
        activeConversationId,
        conversations,
        messages: allMessages,
        fetchMessages,
    } = useChatStore();
    const [lastMessageStatus, setLastMessageStatus] = useState<"delivered" | "seen">(
        "delivered"
    );

    const messages = activeConversationId
        ? allMessages[activeConversationId]?.items ?? []
        : [];

    const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
    const selectedConversations = conversations.find((c) => c._id === activeConversationId);
    const key = `chat-scroll-${activeConversationId}`;

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lastMessage = selectedConversations?.lastMessage;
        if (!lastMessage) {
            return;
        }

        const seenBy = selectedConversations?.seenBy ?? [];

        setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
    }, [selectedConversations]);


    // Scroll to bottom when switching conversations or new messages arrive
    useLayoutEffect(() => {
        if (!containerRef.current || !messagesEndRef.current) return;

        const container = containerRef.current;
        const isAtBottom = container.scrollTop > -50;

        if (isAtBottom || messages.length === 1) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeConversationId, messages.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !activeConversationId) return;

        const item = sessionStorage.getItem(key);
        if (item) {
            const { scrollTop } = JSON.parse(item);
            container.scrollTop = scrollTop;
        } else {
            container.scrollTop = 0;
        }
    }, [activeConversationId]);

    useEffect(() => {
        if (activeConversationId && (!allMessages[activeConversationId] || allMessages[activeConversationId]?.items.length === 0)) {
            fetchMessages(activeConversationId);
        }
    }, [activeConversationId, fetchMessages]);

    const fetchMoreMessages = async () => {
        if (!activeConversationId) return;
        try {
            await fetchMessages(activeConversationId);
        } catch (error) {
            console.error("Error fetching more messages", error);
        }
    };

    const handleScrollSave = () => {
        const container = containerRef.current;
        if (!container || !activeConversationId) return;

        sessionStorage.setItem(
            key,
            JSON.stringify({
                scrollTop: container.scrollTop,
                scrollHeight: container.scrollHeight,
            })
        );
    };

    if (!selectedConversations) {
        return <ChatWelcomeScreen />;
    }

    if (!messages?.length && allMessages[activeConversationId!] && !hasMore) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No messages yet
            </div>
        );
    }

    return (
        <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div
                id="scrollableDiv"
                ref={containerRef}
                onScroll={handleScrollSave}
                className="flex flex-col-reverse flex-1 min-h-0 overflow-y-auto beautiful-scrollbar"
            >
                <div ref={messagesEndRef}></div>
                <InfiniteScroll
                    dataLength={messages.length}
                    next={fetchMoreMessages}
                    hasMore={hasMore}
                    scrollableTarget="scrollableDiv"
                    loader={<p>Loading...</p>}
                    inverse={true}
                    style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        overflow: "visible",
                    }}
                >
                    {messages.map((message, index) => (
                        <MessageItem
                            key={message._id ?? index}
                            message={message}
                            index={index}
                            messages={messages}
                            selectedConvo={selectedConversations}
                            lastMessageStatus={lastMessageStatus}
                        />
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default ChatWindowBody