import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'edusearch-auth' }
  )
);

export const useThemeStore = create(
  persist(
    (set) => ({
      dark: true,
      toggle: () => set((s) => {
        const dark = !s.dark;
        document.documentElement.classList.toggle('dark', dark);
        return { dark };
      }),
    }),
    { name: 'edusearch-theme' }
  )
);

export const useBookStore = create((set) => ({
  books: [],
  activeBook: null,
  setBooks: (books) => set({ books }),
  setActiveBook: (book) => set({ activeBook: book }),
}));
