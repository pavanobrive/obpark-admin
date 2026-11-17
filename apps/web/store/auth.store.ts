import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  setHydrated: (value: boolean) => void
  updateUser: (partial: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, accessToken) => {
        if (typeof document !== 'undefined') {
          document.cookie = 'admin_session=true; path=/; max-age=604800; SameSite=Lax'
        }
        set({ user, accessToken, isAuthenticated: true })
      },

      clearAuth: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'admin_session=; path=/; max-age=0; SameSite=Lax'
        }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      setHydrated: (value) => set({ isHydrated: value }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'obrive-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
