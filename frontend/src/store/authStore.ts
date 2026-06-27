import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Profile {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  fitnessGoal?: string;
  foodPreference?: string;
  monthlyBudget?: number;
  dailyCalorieTarget?: number;
  dailyProteinTarget?: number;
  bmi?: number;
  isProfileComplete?: boolean;
  city?: string;
  gymPreference?: string;
  targetWeight?: number;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user, profile, accessToken, refreshToken } = data.data;
          set({ user, profile, accessToken, refreshToken, isAuthenticated: true });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          toast.success(`Welcome back, ${user.name}! 🎉`);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          const { user, accessToken, refreshToken } = data.data;
          set({ user, profile: null, accessToken, refreshToken, isAuthenticated: true });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          toast.success('Account created! Let\'s set up your profile 🚀');
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch { /* ignore */ }
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, profile: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
          set({ accessToken: newAccess, refreshToken: newRefresh });
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
          return true;
        } catch {
          set({ user: null, profile: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },

      updateProfile: async (profileData) => {
        const { data } = await api.put('/profile', profileData);
        set({ profile: data.data }); // syncs the full recalculated profile back into store
        toast.success('Profile updated!');
      },

      updateUser: (userData) => {
        set((state) => ({ user: state.user ? { ...state.user, ...userData } : null }));
      },

      setTokens: (access, refresh) => {
        set({ accessToken: access, refreshToken: refresh });
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      },
    }),
    {
      name: 'fitrupee-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
