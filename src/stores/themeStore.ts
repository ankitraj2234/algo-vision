import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDark: false,
            toggleTheme: () =>
                set((state) => {
                    const newIsDark = !state.isDark;
                    updateDocumentTheme(newIsDark);
                    return { isDark: newIsDark };
                }),
            setDark: (dark: boolean) =>
                set(() => {
                    updateDocumentTheme(dark);
                    return { isDark: dark };
                }),
        }),
        {
            name: 'algo-vision-theme',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    updateDocumentTheme(state.isDark);
                }
            },
        }
    )
);

function updateDocumentTheme(isDark: boolean) {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Initialize theme on first load
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('algo-vision-theme');
    if (stored) {
        const { state } = JSON.parse(stored);
        updateDocumentTheme(state?.isDark ?? false);
    }
}
