import { create } from 'zustand'
import React from 'react'

export type DialogVariant = 'info' | 'success' | 'warning' | 'error' | 'danger'

export interface DialogOptions {
  title?: string
  message: string | React.ReactNode
  variant?: DialogVariant
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  onConfirm?: () => Promise<void> | void
  onCancel?: () => void
}

interface DialogState {
  isOpen: boolean
  title?: string
  message: string | React.ReactNode
  variant: DialogVariant
  confirmText: string
  cancelText: string
  showCancel: boolean
  isLoading: boolean
  resolvePromise: ((value: boolean) => void) | null
  onConfirmAction?: (() => Promise<void> | void) | null
  onCancelAction?: (() => void) | null

  openDialog: (options: DialogOptions) => Promise<boolean>
  confirm: () => Promise<void>
  cancel: () => void
  close: () => void
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  title: undefined,
  message: '',
  variant: 'info',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  isLoading: false,
  resolvePromise: null,
  onConfirmAction: null,
  onCancelAction: null,

  openDialog: (options: DialogOptions) => {
    // If an existing dialog is open, resolve it first
    const existingResolve = get().resolvePromise
    if (existingResolve) {
      existingResolve(false)
    }

    return new Promise<boolean>((resolve) => {
      const isConfirmOrDanger =
        options.showCancel ?? (options.variant === 'danger' || !!options.cancelText)

      set({
        isOpen: true,
        title: options.title,
        message: options.message,
        variant: options.variant || 'info',
        confirmText: options.confirmText || (isConfirmOrDanger ? 'Confirm' : 'OK'),
        cancelText: options.cancelText || 'Cancel',
        showCancel: isConfirmOrDanger,
        isLoading: false,
        resolvePromise: resolve,
        onConfirmAction: options.onConfirm || null,
        onCancelAction: options.onCancel || null,
      })
    })
  },

  confirm: async () => {
    const { onConfirmAction, resolvePromise } = get()
    if (onConfirmAction) {
      try {
        set({ isLoading: true })
        await onConfirmAction()
      } catch (error) {
        set({ isLoading: false })
        throw error
      }
    }

    set({ isOpen: false, isLoading: false, resolvePromise: null })
    if (resolvePromise) {
      resolvePromise(true)
    }
  },

  cancel: () => {
    const { onCancelAction, resolvePromise } = get()
    if (onCancelAction) {
      try {
        onCancelAction()
      } catch (e) {
        console.error('Error in dialog onCancelAction:', e)
      }
    }

    set({ isOpen: false, isLoading: false, resolvePromise: null })
    if (resolvePromise) {
      resolvePromise(false)
    }
  },

  close: () => {
    const { resolvePromise } = get()
    set({ isOpen: false, isLoading: false, resolvePromise: null })
    if (resolvePromise) {
      resolvePromise(false)
    }
  },
}))
