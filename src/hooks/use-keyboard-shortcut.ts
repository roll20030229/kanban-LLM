'use client'

import { useEffect } from 'react'

interface KeyboardShortcutOptions {
  preventDefault?: boolean
  enabled?: boolean
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
) {
  const { preventDefault = true, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) {
          e.preventDefault()
        }
        callback()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback, preventDefault, enabled])
}

export function useKeyboardShortcutWithModifier(
  key: string,
  callback: () => void,
  modifiers: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  } = {},
  options: KeyboardShortcutOptions = {}
) {
  const { preventDefault = true, enabled = true } = options
  const { ctrl = false, shift = false, alt = false, meta = false } = modifiers

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      const match =
        e.key.toLowerCase() === key.toLowerCase() &&
        (ctrl ? e.ctrlKey : true) &&
        (shift ? e.shiftKey : true) &&
        (alt ? e.altKey : true) &&
        (meta ? e.metaKey : true)

      if (match) {
        if (preventDefault) {
          e.preventDefault()
        }
        callback()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback, preventDefault, enabled, ctrl, shift, alt, meta])
}
