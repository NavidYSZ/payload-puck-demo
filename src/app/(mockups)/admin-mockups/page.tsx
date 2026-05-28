import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BrandMark } from '@/components/mockups/shared'
import { ThemeToggle } from '@/components/mockups/shared'

export const metadata = {
  title: 'Admin Sidebar Mockups',
  description: 'Drei Designvarianten für die Studio Admin Sidebar.',
}

const variants = [
  {
    slug: 'v1',
    name: 'Variant A',
    tag: 'Linear-modern',
    description:
      'Die sichere Standardlösung. 240px breit, gruppierte Navigation mit dezenten Section-Headern, Suchfeld mit ⌘K, dezentes Active-Highlight. So sehen die meisten modernen SaaS-Admins heute aus.',
    width: '240px',
    feel: 'Vertraut · Lesbar · Diszipliniert',
  },
  {
    slug: 'v2',
    name: 'Variant B',
    tag: 'Notion-workspace',
    description:
      'Workspace als hierarchischer Baum. Seiten und Beiträge sind direkt aufklappbar mit Drag-Handles und Quick-Actions. Pinned-Sektion oben, mehr visuelle Tiefe durch Einrückungen. Stärkstes Werkzeug-Gefühl.',
    width: '260px',
    feel: 'Tief · Strukturiert · Macher',
  },
  {
    slug: 'v3',
    name: 'Variant C',
    tag: 'Icon-rail',
    description:
      'Maximale Ruhe für den Content. 60px schmaler Icon-Rail, expandiert auf Hover oder Pin. Status-Dots auf eingeklappten Icons. Sehr Cursor / Arc / Raycast-artig — der Content bekommt alle Aufmerksamkeit.',
    width: '60 → 240px',
    feel: 'Minimal · Fokussiert · Modern',
  },
] as const

export default function MockupsIndexPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-12 lg:py-16">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 pb-10">
          <div className="flex items-center gap-3">
            <BrandMark size={36} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Studio · Design exploration
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Admin Sidebar Mockups</h1>
              <p className="mt-1.5 max-w-[560px] text-sm text-muted-foreground">
                Drei philosophisch unterschiedliche Sidebar-Konzepte für den Studio Admin. Gleicher
                Dashboard-Inhalt rechts — nur die Sidebar variiert. Alle in Light + Dark, monochrom.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <Separator />

        {/* Variants grid */}
        <section className="mt-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {variants.map((v) => (
              <Link key={v.slug} href={`/admin-mockups/${v.slug}`} className="group block">
                <Card className="relative h-full overflow-hidden border-border bg-card p-0 shadow-none transition-all duration-150 hover:border-foreground/30 hover:shadow-md">
                  {/* Visual preview */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted/40">
                    <SidebarPreview slug={v.slug} />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
                        {v.name}
                      </Badge>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      {v.tag}
                    </h2>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                      {v.description}
                    </p>

                    <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-mono text-foreground/70">{v.width}</span>
                        <span>Breite</span>
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <p className="text-[11px] text-muted-foreground">{v.feel}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Mockups · Reine Vorschau · keine Verbindung zum echten Admin-Bereich
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Neutral palette · Geist Sans · oklch greyscale
          </p>
        </footer>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini visual preview for each variant on the index card.
// Pure presentational SVG/HTML — no interaction needed.
// ---------------------------------------------------------------------------

const SidebarPreview: React.FC<{ slug: 'v1' | 'v2' | 'v3' }> = ({ slug }) => {
  if (slug === 'v1') {
    return (
      <div className="flex h-full w-full">
        <div className="flex h-full w-[38%] flex-col border-r border-border bg-sidebar p-2">
          <div className="mb-2 flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-[3px] bg-foreground" />
            <div className="h-1.5 flex-1 rounded bg-foreground/60" />
          </div>
          <div className="mb-2 h-3 rounded border border-border/80 bg-background/60" />
          <div className="mb-1 h-1 w-6 rounded bg-muted-foreground/40" />
          {[true, false, false].map((active, i) => (
            <div
              key={i}
              className={cnPreview(
                'mb-0.5 flex items-center gap-1 rounded px-1 py-0.5',
                active && 'bg-accent',
              )}
            >
              <div className="h-1.5 w-1.5 rounded-sm bg-foreground/70" />
              <div className="h-1 flex-1 rounded bg-foreground/40" />
            </div>
          ))}
          <div className="mb-1 mt-1.5 h-1 w-7 rounded bg-muted-foreground/40" />
          {[false, false, false, false].map((_, i) => (
            <div key={i} className="mb-0.5 flex items-center gap-1 rounded px-1 py-0.5">
              <div className="h-1.5 w-1.5 rounded-sm bg-foreground/40" />
              <div className="h-1 flex-1 rounded bg-foreground/25" />
            </div>
          ))}
          <div className="mt-auto flex items-center gap-1 border-t border-border pt-1.5">
            <div className="h-3 w-3 rounded-full bg-foreground" />
            <div className="flex-1 space-y-0.5">
              <div className="h-1 w-2/3 rounded bg-foreground/50" />
              <div className="h-1 w-1/2 rounded bg-foreground/30" />
            </div>
          </div>
        </div>
        <PreviewContent />
      </div>
    )
  }
  if (slug === 'v2') {
    return (
      <div className="flex h-full w-full">
        <div className="flex h-full w-[42%] flex-col border-r border-border bg-sidebar p-2">
          <div className="mb-2 flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-[3px] bg-foreground" />
            <div className="flex-1 space-y-0.5">
              <div className="h-1 w-3/4 rounded bg-foreground/60" />
              <div className="h-1 w-1/2 rounded bg-foreground/30" />
            </div>
          </div>
          <div className="mb-1 h-1 w-7 rounded bg-muted-foreground/40" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-0.5 flex items-center gap-1 rounded px-1 py-0.5">
              <div className="h-1.5 w-1.5 rounded-sm bg-foreground/40" />
              <div className="h-1 flex-1 rounded bg-foreground/35" />
            </div>
          ))}
          <div className="mb-1 mt-1.5 h-1 w-9 rounded bg-muted-foreground/40" />
          <div className="flex items-center gap-1 rounded px-1 py-0.5">
            <div className="h-1.5 w-1.5 rotate-90 text-foreground/60">▸</div>
            <div className="h-1 flex-1 rounded bg-foreground/55" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-0.5 ml-3 flex items-center gap-1 rounded px-1 py-0.5">
              <div className="h-1.5 w-1.5 rounded-sm bg-foreground/30" />
              <div className="h-1 flex-1 rounded bg-foreground/25" />
            </div>
          ))}
          <div className="flex items-center gap-1 rounded px-1 py-0.5">
            <div className="h-1.5 w-1.5 text-foreground/60">▸</div>
            <div className="h-1 flex-1 rounded bg-foreground/45" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="mb-0.5 ml-3 flex items-center gap-1 rounded px-1 py-0.5">
              <div className="h-1.5 w-1.5 rounded-sm bg-foreground/25" />
              <div className="h-1 flex-1 rounded bg-foreground/20" />
            </div>
          ))}
        </div>
        <PreviewContent />
      </div>
    )
  }
  // v3
  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-[14%] flex-col items-center gap-1 border-r border-border bg-sidebar p-1.5">
        <div className="h-3 w-3 rounded-[3px] bg-foreground" />
        <div className="mt-1 h-3 w-3 rounded bg-foreground" />
        <div className="h-3 w-3 rounded border border-border bg-background/60" />
        <div className="mt-1 h-3 w-3 rounded bg-accent" />
        <div className="relative h-3 w-3 rounded bg-foreground/15">
          <span className="absolute right-0 top-0 inline-block h-1 w-1 rounded-full bg-foreground" />
        </div>
        <div className="relative h-3 w-3 rounded bg-foreground/15">
          <span className="absolute right-0 top-0 inline-block h-1 w-1 rounded-full bg-foreground/60" />
        </div>
        <div className="h-3 w-3 rounded bg-foreground/15" />
        <div className="h-3 w-3 rounded bg-foreground/15" />
        <div className="mt-auto h-3 w-3 rounded-full bg-foreground" />
      </div>
      <PreviewContent wider />
    </div>
  )
}

const PreviewContent: React.FC<{ wider?: boolean }> = ({ wider }) => (
  <div className="flex h-full flex-1 flex-col p-2">
    <div className="mb-1 h-1.5 w-1/3 rounded bg-foreground/70" />
    <div className="mb-2 h-1 w-1/5 rounded bg-foreground/30" />
    <div className="mb-2 grid grid-cols-4 gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-7 rounded border border-border bg-background/60" />
      ))}
    </div>
    <div className="space-y-1 rounded border border-border bg-background/60 p-1">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-foreground/20" />
          <div className="h-1 flex-1 rounded bg-foreground/25" />
          <div className="h-1 w-4 rounded bg-foreground/15" />
        </div>
      ))}
    </div>
    <div className={cnPreview('mt-auto h-1 w-full rounded bg-foreground/10', wider && 'opacity-0')} />
  </div>
)

// Tiny inline cn since the page is a server component and doesn't need the full utility.
function cnPreview(...parts: (string | false | undefined | null)[]) {
  return parts.filter(Boolean).join(' ')
}
