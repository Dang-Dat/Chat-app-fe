import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "../skeleton/ChatWindowSkeleton";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import { useEffect } from "react";


const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading,
    messages,
    markAsSeen,
  } = useChatStore();

  const selectedConvo =
    conversations.find((c) => c._id === activeConversationId) ?? null;

  useEffect(() => {
    if (!selectedConvo) {
      return;
    }

    const markSeen = async () => {
      try {
        await markAsSeen();
      } catch (error) {
        console.error("error markSeen", error);
      }
    };

    markSeen();
  }, [markAsSeen, selectedConvo]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  const hasMessages = messages[activeConversationId!] && messages[activeConversationId!].items.length > 0;
  const isInitialLoading = messageLoading && !hasMessages;

  return (
    <div className="flex flex-col h-full flex-1 overflow-hidden">
      {/* Header */}
      <ChatWindowHeader chat={selectedConvo} />

      {/* Body */}
      <div className="flex-1 overflow-hidden bg-primary-foreground flex flex-col min-h-0">
        {isInitialLoading ? <ChatWindowSkeleton /> : <ChatWindowBody />}
      </div>

      {/* Footer */}
      <MessageInput selectedConvo={selectedConvo} />
    </div>
  );
};

export default ChatWindowLayout;