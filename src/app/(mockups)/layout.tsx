import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { cn } from '@/utilities/ui'
import '../(frontend)/globals.css'

export const metadata: Metadata = {
  title: 'Admin Sidebar Mockups',
  description: 'Design exploration for the studio admin sidebar.',
}

export default function MockupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, 'dark')}
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
