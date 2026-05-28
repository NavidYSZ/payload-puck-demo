'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'

import { cn } from '@/utilities/ui'

/**
 * Small monochrome mark used as the brand logo in every sidebar variant.
 * Black rounded square with a single white glyph — looks like Linear/Vercel marks.
 */
export const BrandMark: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 28,
}) => (
  <div
    className={cn(
      'inline-flex items-center justify-center rounded-[7px] bg-foreground text-background',
      className,
    )}
    style={{ width: size, height: size }}
    aria-hidden
  >
    <svg
      width={Math.round(size * 0.55)}
      height={Math.round(size * 0.55)}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3 3.5 H8.6 C11.3 3.5 13.5 5.7 13.5 8.4 C13.5 11.1 11.3 13.3 8.6 13.3 H3 Z M5.5 5.9 V10.9 H8.6 C10 10.9 11.1 9.8 11.1 8.4 C11.1 7 10 5.9 8.6 5.9 Z"
        fill="currentColor"
      />
    </svg>
  </div>
)

/**
 * Theme toggle. Operates on the <html> element via the .dark class — matching
 * how the frontend's globals.css scopes dark variants.
 */
export const ThemeToggle: React.FC<{ className?: string; compact?: boolean }> = ({
  className,
  compact,
}) => {
  const [isDark, setIsDark] = React.useState(true)

  React.useEffect(() => {
    const root = document.documentElement
    setIsDark(root.classList.contains('dark'))
  }, [])

  const toggle = React.useCallback(() => {
    const root = document.documentElement
    const next = !root.classList.contains('dark')
    root.classList.toggle('dark', next)
    setIsDark(next)
  }, [])

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        title={isDark ? 'Light mode' : 'Dark mode'}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          className,
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        className,
      )}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      <span>{isDark ? 'Light' : 'Dark'} mode</span>
    </button>
  )
}

/**
 * Tiny keyboard-shortcut hint used in search affordances.
 */
export const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <kbd
    className={cn(
      'inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground',
      className,
    )}
  >
    {children}
  </kbd>
)
