'use client'

import { create } from 'zustand'

interface CartStoreState {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartStoreState>((set) => ({
  isOpen: false,

  openCart: () =>
    set({
      isOpen: true,
    }),

  closeCart: () =>
    set({
      isOpen: false,
    }),

  toggleCart: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
}))