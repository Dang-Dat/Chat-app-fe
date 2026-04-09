import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";
import { setToken, getToken } from "@/lib/tokenStorage";


export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({
    accessToken: getToken(),
    user: null,
    loading: false,
    setUser: (user) => set({ user }),

    clearState: () => {
      set({ accessToken: null, user: null, loading: false })
      setToken(null);
    },

    setAccessToken: (accessToken) => {
      set({ accessToken });
      setToken(accessToken);
    },

    signUp: async (username, password, email, firstName, lastName) => {
      try {
        set({ loading: true })
        await authService.signUp(username, password, email, firstName, lastName);
        toast.success("Sign up successful");
      } catch (error: any) {
        console.log(error);
        toast.error(error.response?.data?.message || error.message || "An error occurred during sign up");
      } finally {
        set({ loading: false })
      }
    },
    signIn: async (username, password) => {
      try {
        set({ loading: true })

        get().clearState();
        useChatStore.getState().reset();

        const { accessToken } = await authService.signIn(username, password);
        get().setAccessToken(accessToken);

        await get().fetchMe();
        await useChatStore.getState().fetchConversations();
        toast.success("Sign in successful");
        return true;
      } catch (error: any) {
        console.log(error);
        toast.error(error.response?.data?.message || error.message || "An error occurred during sign in");
        return false;
      } finally {
        set({ loading: false })
      }
    },
    signOut: async () => {
      try {
        set({ loading: true })
        get().clearState();
        await authService.signOut();

        toast.success("Logout successful");
      } catch (error: any) {
        console.log(error);
        toast.error(error.response?.data?.message || error.message || "An error occurred during sign out");
      } finally {
        set({ loading: false })
      }
    },

    fetchMe: async () => {
      try {
        set({ loading: true });
        const user = await authService.fetchMe();
        set({ user });
      } catch (error: any) {
        console.log(error)
        toast.error(error.response?.data?.message || error.message || "An error occurred during fetch me");
      } finally {
        set({ loading: false });
      }
    },

    refresh: async () => {
      set({ loading: true });
      try {
        const { accessToken } = await authService.refresh();
        set({ accessToken });

        await get().fetchMe();

        return accessToken;
      } catch (error: any) {
        console.log(error);
        get().clearState();
        return null;
      } finally {
        set({ loading: false });
      }
    },


  }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      })
    }
  )
);