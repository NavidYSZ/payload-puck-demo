import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import MockDashboard from '@/components/mockups/MockDashboard'
import SidebarVariantB from '@/components/mockups/SidebarVariantB'

export const metadata = {
  title: 'Variant B · Notion-workspace · Admin Sidebar Mockups',
}

export default function VariantBPage() {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarVariantB />
      <main className="relative min-w-0 flex-1 bg-background">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
          <Link
            href="/admin-mockups"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Alle Varianten
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Variant B · Notion-workspace
          </p>
        </div>
        <MockDashboard variantLabel="B" />
      </main>
    </div>
  )
}
