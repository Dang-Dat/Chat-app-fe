import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist((set, get) => ({
        isDark: false,
        toggleTheme: () => {
            const newValue = !get().isDark;
            set({ isDark: newValue });

            if (newValue) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        },
        setTheme: (dark: boolean) => {
            set({ isDark: dark });
            if (dark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }),
        {

            name: "theme",
        }));