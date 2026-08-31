import { create } from 'zustand';
import { getCurrentUser, signOut, AuthUser } from '../services/api/auth';
import { Profile } from '../types';
import { getProfile } from '../services/api/profileService';

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, loading: false });
      if (user) {
        try {
          const profile = await getProfile(user.id);
          set({ profile });
        } catch {
          // profile not created yet
        }
      }
    } catch {
      set({ user: null, loading: false });
    }
    set({ initialized: true });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    const profile = await getProfile(user.id);
    set({ profile });
  },

  setProfile: (profile) => set({ profile }),

  logout: async () => {
    await signOut();
    set({ user: null, profile: null });
  },
}));
