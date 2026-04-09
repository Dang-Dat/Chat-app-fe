import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";
import { toast } from "sonner";

let baseURL = import.meta.env.VITE_SOCKET_URL;
if (baseURL && baseURL.startsWith("http")) {
    baseURL = baseURL.replace(/^http/, "ws");
}

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if (existingSocket && existingSocket.readyState === window.WebSocket.OPEN) return;

        if (!accessToken || !baseURL) return;

        const wsUrl = `${baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL}/websocket?token=${accessToken}`;
        const socket = new window.WebSocket(wsUrl);
        set({ socket });

        socket.onopen = () => {
            console.log("Connected to websocket");
        };

        socket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                const { type, data } = payload;
                switch (type) {
                    case "online-users":
                        set({ onlineUsers: data });
                        break;

                    case "new-message": {
                        const { message, conversation, unreadCounts } = data;
                        if (!message || !conversation) break;

                        const convoId = message.conversationId ?? (conversation._id || conversation.id);
                        useChatStore.getState().addMessage({ ...message, conversationId: convoId });

                        const convoLastMessage = conversation.lastMessage;
                        const lastMessage = convoLastMessage ? {
                            _id: convoLastMessage._id || convoLastMessage.id,
                            content: convoLastMessage.content,
                            createdAt: convoLastMessage.createdAt,
                            sender: {
                                _id: convoLastMessage.senderId,
                                displayName: "",
                                avatarUrl: null,
                            },
                        } : null;

                        const updatedConversation = {
                            ...conversation,
                            _id: conversation._id || conversation.id,
                            lastMessage,
                            unreadCounts,
                        };

                        if (useChatStore.getState().activeConversationId === message.conversationId) {
                            useChatStore.getState().markAsSeen();
                        }

                        useChatStore.getState().updateConversation(updatedConversation);
                        break;
                    }

                    case "read-message": {
                        const { conversation, lastMessage } = data;
                        if (!conversation) break;

                        const updated = {
                            ...conversation,
                            _id: conversation._id || conversation.id,
                            lastMessage,
                        };

                        useChatStore.getState().updateConversation(updated);
                        break;
                    }

                    case "new-group": {
                        useChatStore.getState().addConvo(data);
                        break;
                    }
                }
            } catch (error) {
                console.error("Failed to parse message:", error);
                toast.error("Failed to parse message");
            }
        };

        socket.onclose = () => {
            console.log("Socket disconnected");
            set({ socket: null });
        };

        socket.onerror = (error) => {
            console.error("Websocket error:", error);
        };
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.close();
            set({ socket: null, onlineUsers: [] });
        }
    }
}))