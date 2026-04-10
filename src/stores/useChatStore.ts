import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chatService";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      loading: false,
      messageLoading: false,

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          loading: false,
          messageLoading: false,
        });
      },

      fetchConversations: async () => {
        try {
          set({ loading: true });
          const { conversations } = await chatService.fetchConversations();
          const normalized = (conversations || []).map((c: any) => ({
            ...c,
            _id: c._id || c.id,
          }));
          set({ conversations: normalized, loading: false });
        } catch (error: any) {
          console.log(error);
          toast.error(error.response?.data?.message || error.message || "An error occurred during fetch conversations");
        } finally {
          set({ loading: false });
        }
      },

      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages, messageLoading } = get();
        
        if (messageLoading) return; 

        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId];
        const nextCursor = current?.nextCursor === undefined ? "" : current.nextCursor;

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(convoId, nextCursor);

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));
          set((state) => {
            const prevItems = state.messages[convoId]?.items || [];
            const merged = [...prevItems, ...processed];

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                }
              }
            }
          });
        } catch (error: any) {
          console.log(error);
          toast.error(error.response?.data?.message || error.message || "An error occurred during fetch messages");
        } finally {
          set({ messageLoading: false });
        }
      },

      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          const message = await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined
          );
          
          if (message) {
            const convoId = message.conversationId || activeConversationId;
            get().addMessage({ ...message, conversationId: convoId });
          }

          set((state) => ({
            conversations: state.conversations.map((c) => {
              const currentId = (c._id || c.id)?.toString();
              return currentId === activeConversationId?.toString() ? { ...c, seenBy: [] } : c;
            }),
          }));
        } catch (error) {
          console.error("Error sending direct message", error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          const message = await chatService.sendGroupMessage(conversationId, content, imgUrl);
          
          if (message) {
            const convoId = message.conversationId || conversationId;
            get().addMessage({ ...message, conversationId: convoId });
          }

          set((state) => ({
            conversations: state.conversations.map((c) => {
              const currentId = (c._id || c.id)?.toString();
              const targetId = (conversationId || get().activeConversationId)?.toString();
              return currentId === targetId ? { ...c, seenBy: [] } : c;
            }),
          }));
        } catch (error) {
          console.error("Error sending group message", error);
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();

          const convoId = message.conversationId?.toString();
          if (!convoId) return;

          const newMessage = {
            ...message,
            _id: message._id || message.id,
            isOwn: message.senderId === (user?._id || user?.id),
          };

          set((state) => {
            const prevItems = state.messages[convoId]?.items ?? [];

    
            if (prevItems.some((m) => (m._id || m.id) === newMessage._id)) {
              return state;
            }

            const updatedMessages = {
              ...state.messages,
              [convoId]: {
                items: [newMessage, ...prevItems],
                hasMore: state.messages[convoId]?.hasMore ?? true,
                nextCursor: state.messages[convoId]?.nextCursor,
              },
            };

            const updatedConversations = state.conversations.map((c) => {
              const currentId = (c._id || c.id)?.toString();
              if (currentId === convoId) {
                return {
                  ...c,
                  lastMessage: {
                    _id: newMessage._id || "",
                    content: newMessage.content || "",
                    createdAt: newMessage.createdAt,
                    sender: {
                      _id: newMessage.senderId,
                      displayName: "", 
                      avatarUrl: null,
                    },
                  },
                  lastMessageAt: newMessage.createdAt,
                };
              }
              return c;
            });

            return {
              messages: updatedMessages,
              conversations: updatedConversations,
            };
          });
        } catch (error) {
          console.error("Error adding message", error);
        }
      },
      updateConversation: (conversation: any) => {
        const convoId = (conversation._id || conversation.id)?.toString();
        set((state) => ({
          conversations: state.conversations.map((c) =>
            (c._id || c.id)?.toString() === convoId ? { ...c, ...conversation } : c
          ),
        }));
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();

          if (!activeConversationId || !user) {
            return;
          }

          const convo = conversations.find((c) => c._id === activeConversationId);

          if (!convo) {
            return;
          }

          const currentUserId = (user._id || user.id) as string;
          if ((convo.unreadCounts?.[currentUserId] ?? 0) === 0) {
            return;
          }

          await chatService.markAsSeen(activeConversationId);

          set((state) => ({
            conversations: state.conversations.map((c) => {
              const currentId = (c._id || c.id)?.toString();
              return currentId === activeConversationId?.toString() && c.lastMessage
                ? {
                  ...c,
                  unreadCounts: {
                    ...c.unreadCounts,
                    [currentUserId]: 0,
                  },
                }
                : c;
            }),
          }));
        } catch (error) {
          console.error("error markAsSeen in store", error);
        }
      },
      addConvo: (convo) => {
        if (!convo) return;
        const convoId = (convo._id || convo.id)?.toString();
        if (!convoId) {
          console.error("Conversation ID is missing in addConvo:", convo);
          return;
        }

        set((state) => {
          const exists = state.conversations.some((c) => {
            const currentId = (c._id || c.id)?.toString();
            return currentId === convoId;
          });

          return {
            conversations: exists
              ? state.conversations
              : [{ ...convo, _id: convo._id || convo.id }, ...state.conversations],
            activeConversationId: convoId,
          };
        });
      },
      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds
          );

          get().addConvo(conversation);

        } catch (error) {
          console.error("Error calling createConversation in store", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
);

