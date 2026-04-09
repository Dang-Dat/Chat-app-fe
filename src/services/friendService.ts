import api from "@/lib/axios";
import { toast } from "sonner";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api.get(`/users/search?username=${username}`);
    return res.data.user;
  },

  async sendFriendRequest(to: string, message?: string) {
    try {
      const res = await api.post("/friends/requests", { to, message });
      return res.data.message;
    } catch (error: any) {
      console.error("Error sendFriendRequest", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred during send friend request");
    }
  },

  async getAllFriendRequest() {
    try {
      const res = await api.get("/friends/requests");
      const { sent, received } = res.data;
      return { sent, received };
    } catch (error: any) {
      console.error("Error getAllFriendRequest", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred during get all friend requests");
    }
  },

  async acceptRequest(requestId: string) {
    try {
      const res = await api.post(`/friends/requests/${requestId}/accept`);
      return res.data.requestAcceptedBy;
    } catch (error: any) {
      console.error("Error acceptRequest", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred during accept request");
    }
  },

  async declineRequest(requestId: string) {
    try {
      await api.post(`/friends/requests/${requestId}/decline`);
    } catch (error: any) {
      console.error("Error declineRequest", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred during decline request");
    }
  },

  async getFriendList() {
    const res = await api.get("/friends");
    return res.data.friends;
  },
};
