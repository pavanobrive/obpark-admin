import { useDialogStore, DialogOptions, DialogVariant } from '@/store/dialog.store'
import React from 'react'

export interface DialogAlertInput {
  title?: string
  message: string | React.ReactNode
  variant?: DialogVariant
  confirmText?: string
}

export interface DialogConfirmInput {
  title?: string
  message: string | React.ReactNode
  variant?: DialogVariant
  confirmText?: string
  cancelText?: string
  onConfirm?: () => Promise<void> | void
}

/**
 * Universal Dialog acting like a function call when an action or alert is needed.
 * Can be called anywhere in component handlers, async functions, TanStack Query mutations, etc.
 *
 * Examples:
 *   await dialog.alert('Image uploaded successfully!')
 *   await dialog.alert({ title: 'Error', message: 'Failed to upload image', variant: 'error' })
 *
 *   const confirmed = await dialog.confirm('Are you sure you want to delete this?')
 *   if (confirmed) { ... }
 *
 *   const ok = await dialog.confirm({
 *     title: 'Delete Category',
 *     message: 'This will remove the category permanently.',
 *     confirmText: 'Delete',
 *     variant: 'danger',
 *   })
 */
export const dialog = {
  /**
   * Alert dialog (replaces window.alert)
   */
  alert: async (input: string | DialogAlertInput): Promise<void> => {
    const opts: DialogOptions =
      typeof input === 'string'
        ? {
            title: 'Notice',
            message: input,
            variant: 'info',
            confirmText: 'OK',
            showCancel: false,
          }
        : {
            title: input.title ?? 'Notice',
            message: input.message,
            variant: input.variant ?? 'info',
            confirmText: input.confirmText ?? 'OK',
            showCancel: false,
          }

    await useDialogStore.getState().openDialog(opts)
  },

  /**
   * Confirmation / Action dialog (replaces window.confirm)
   * Resolves true if confirmed, false if cancelled or dismissed.
   */
  confirm: async (input: string | DialogConfirmInput): Promise<boolean> => {
    const opts: DialogOptions =
      typeof input === 'string'
        ? {
            title: 'Confirm Action',
            message: input,
            variant: 'danger',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            showCancel: true,
          }
        : {
            title: input.title ?? 'Confirm Action',
            message: input.message,
            variant: input.variant ?? 'danger',
            confirmText: input.confirmText ?? 'Confirm',
            cancelText: input.cancelText ?? 'Cancel',
            showCancel: true,
            onConfirm: input.onConfirm,
          }

    return await useDialogStore.getState().openDialog(opts)
  },

  /**
   * Generic show dialog with arbitrary custom options
   */
  show: async (options: DialogOptions): Promise<boolean> => {
    return await useDialogStore.getState().openDialog(options)
  },
}

// Standalone function exports for direct calling
export const showDialog = dialog.show
export const alertDialog = dialog.alert
export const confirmDialog = dialog.confirm
