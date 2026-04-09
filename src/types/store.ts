import { authService } from "@/services/authService";
import type { Friend, FriendRequest, User } from "./user";
import type { Conversation, Message } from "./chat";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  setUser: (user: User) => void;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void;
  signUp: (username: string, password: string, email: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<string | null>;

}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, {
    items: Message[];
    hasMore: boolean;
    nextCursor?: string | null;
  }>;
  activeConversationId: string | null;
  loading: boolean;
  messageLoading: boolean;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string
  ) => Promise<void>;
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string
  ) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;

  updateConversation: (conversation: Partial<Conversation> & { _id: string }) => void;
  markAsSeen: () => Promise<void>;
  addConvo: (convo: Conversation) => void;
  createConversation: (
    type: "group" | "direct",
    name: string,
    memberIds: string[]
  ) => Promise<void>;
}
export interface SocketState {
  socket: WebSocket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}


export interface FriendState {
  friends: Friend[];
  loading: boolean;
  receivedList: FriendRequest[];
  sentList: FriendRequest[];
  isOpenRequestDialog: boolean;
  setOpenRequestDialog: (open: boolean) => void;
  searchByUsername: (username: string) => Promise<User | null>;
  addFriend: (to: string, message?: string) => Promise<string>;
  getAllFriendRequests: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  getFriends: () => Promise<void>;
}



export interface UserState {
  updateAvatarUrl: (formData: FormData) => Promise<void>;
}
