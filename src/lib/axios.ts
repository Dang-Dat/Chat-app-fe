import axios from "axios";
import { getToken, setToken } from "./tokenStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});


api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    (response) => {
 
        if (response.config.url?.endsWith("/users/me")) {
            console.log("Welcome back:", response.data.user?.displayName);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await api.post("/auth/refresh");
                const { accessToken } = response.data;

                setToken(accessToken);
                const { useAuthStore } = await import("@/stores/useAuthStore");
                useAuthStore.getState().setAccessToken(accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                const { useAuthStore } = await import("@/stores/useAuthStore");
                useAuthStore.getState().clearState();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
