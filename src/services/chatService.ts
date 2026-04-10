import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";
interface FetchMessageProps {
  messages: Message[],
  cursor?: string;
}
const pageLimit = 20;
export const chatService = {

  async fetchConversations(): Promise<ConversationResponse> {
    const response = await api.get("/conversations");
    return response.data;
  },
  async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> {
    const cursorParam = cursor ? `&cursor=${cursor}` : "";
    const response = await api.get(`conversations/${id}/messages?limit=${pageLimit}${cursorParam}`);
    return { messages: response.data.messages, cursor: response.data.nextCursor }
  },
  async sendDirectMessage(
    recipientId: string,
    content: string,
    imgUrl?: string,
    conversationId?: string
  ) {
    const response = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });
    return response.data;
  },

  async sendGroupMessage(conversationId: string, content: string, imgUrl?: string) {
    const response = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return response.data;
  },

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[]
  ) {
    const res = await api.post("/conversations", { type, name, memberIds });
    return res.data.conversation;
  },
};



