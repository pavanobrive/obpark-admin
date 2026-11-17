'use client'

import React, { useEffect, useRef } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Loader2,
} from 'lucide-react'
import { useDialogStore, DialogVariant } from '@/store/dialog.store'
import { microgrammaBold } from '@/lib/fonts'

export function UniversalDialog() {
  const {
    isOpen,
    title,
    message,
    variant,
    confirmText,
    cancelText,
    showCancel,
    isLoading,
    confirm,
    cancel,
  } = useDialogStore()

  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  // Auto focus confirm button when dialog opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Lock body scroll and handle keyboard events (Escape to close, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      } else if (e.key === 'Enter' && !isLoading) {
        // Only trigger confirm if active element is not cancel button
        const active = document.activeElement
        if (active?.getAttribute('data-dialog-cancel') !== 'true') {
          e.preventDefault()
          confirm()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, confirm, cancel])

  if (!isOpen) return null

  const getVariantConfig = (v: DialogVariant) => {
    switch (v) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          iconBg: 'bg-red-50 ring-8 ring-red-50/50',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-red-500',
          titleColor: 'text-red-950',
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-50 ring-8 ring-rose-50/50',
          confirmBtn: 'bg-[#074139] hover:bg-[#052e28] text-white shadow-xs focus:ring-[#074139]',
          titleColor: 'text-gray-900',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-50 ring-8 ring-amber-50/50',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500',
          titleColor: 'text-amber-950',
        }
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-50 ring-8 ring-emerald-50/50',
          confirmBtn: 'bg-[#074139] hover:bg-[#052e28] text-white shadow-xs focus:ring-[#074139]',
          titleColor: 'text-emerald-950',
        }
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-[#074139]" />,
          iconBg: 'bg-emerald-50 ring-8 ring-emerald-50/50',
          confirmBtn: 'bg-[#074139] hover:bg-[#052e28] text-white shadow-xs focus:ring-[#074139]',
          titleColor: 'text-gray-900',
        }
    }
  }

  const config = getVariantConfig(variant)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="universal-dialog-title"
      aria-describedby="universal-dialog-description"
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={cancel}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Dialog Box Panel */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={cancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Variant Icon */}
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${config.iconBg}`}
            >
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              {title && (
                <h3
                  id="universal-dialog-title"
                  className={`${microgrammaBold.className} text-base sm:text-lg font-bold ${config.titleColor} leading-tight`}
                >
                  {title}
                </h3>
              )}
              <div
                id="universal-dialog-description"
                className={`text-sm text-gray-600 leading-relaxed break-words whitespace-pre-line ${
                  title ? 'mt-2' : 'mt-0'
                }`}
              >
                {message}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100">
          {showCancel && (
            <button
              type="button"
              data-dialog-cancel="true"
              onClick={cancel}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200/60 border border-gray-200 bg-white transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={confirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${config.confirmBtn}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
