import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  login: (user, token) => set({ user, token, isLoading: false }),
  logout: () => set({ user: null, token: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
