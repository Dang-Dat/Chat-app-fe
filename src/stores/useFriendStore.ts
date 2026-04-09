import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
    friends: [],
    loading: false,
    receivedList: [],
    sentList: [],
    isOpenRequestDialog: false,
    setOpenRequestDialog: (open: boolean) => set({ isOpenRequestDialog: open }),
    searchByUsername: async (username) => {
        try {
            set({ loading: true });

            const user = await friendService.searchByUsername(username);

            return user;
        } catch (error: any) {
            console.error("error searchByUsername", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred during search by username");
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addFriend: async (to, message) => {
        try {
            set({ loading: true });
            const resultMessage = await friendService.sendFriendRequest(to, message);
            return resultMessage;
        } catch (error: any) {
            console.error("error addFriend", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred during add friend");
        } finally {
            set({ loading: false });
        }
    },
    getAllFriendRequests: async () => {
        try {
            set({ loading: true });

            const result = await friendService.getAllFriendRequest();

            if (!result) return;

            const { received, sent } = result;

            set({ receivedList: received, sentList: sent });
        } catch (error: any) {
            console.error("error getAllFriendRequests", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred during get all friend requests");
        } finally {
            set({ loading: false });
        }
    },
    acceptRequest: async (requestId) => {
        try {
            set({ loading: true });
            await friendService.acceptRequest(requestId);

            set((state) => ({
                receivedList: state.receivedList.filter((r) => r._id !== requestId),
            }));

            await get().getFriends();
        } catch (error: any) {
            console.error("error acceptRequest", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred during accept request");
        }
        finally {
            set({ loading: false });
        }
    },
    declineRequest: async (requestId) => {
        try {
            set({ loading: true });
            await friendService.declineRequest(requestId);

            set((state) => ({
                receivedList: state.receivedList.filter((r) => r._id !== requestId),
            }));
        } catch (error: any) {
            console.error("error declineRequest", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred during decline request");
        } finally {
            set({ loading: false });
        }
    },
    getFriends: async () => {
        try {
            set({ loading: true });
            const friends = await friendService.getFriendList();
            set({ friends: friends });
        } catch (error: any) {
            console.error("error getFriends", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred during get friends");
            set({ friends: [] });
        } finally {
            set({ loading: false });
        }
    },

}));