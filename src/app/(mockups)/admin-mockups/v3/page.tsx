import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import MockDashboard from '@/components/mockups/MockDashboard'
import SidebarVariantC from '@/components/mockups/SidebarVariantC'

export const metadata = {
  title: 'Variant C · Icon-rail · Admin Sidebar Mockups',
}

export default function VariantCPage() {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarVariantC />
      <main className="relative min-w-0 flex-1 bg-background">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
          <Link
            href="/admin-mockups"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Alle Varianten
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Variant C · Icon-rail
          </p>
        </div>
        <MockDashboard variantLabel="C" />
      </main>
    </div>
  )
}
