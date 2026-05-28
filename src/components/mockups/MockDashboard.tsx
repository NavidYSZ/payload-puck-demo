import * as React from 'react'
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutPanelTop,
  PenLine,
  Plus,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'

/**
 * Shared placeholder dashboard used inside every mockup variant.
 * Identical across variants so the only visual difference is the sidebar.
 */

type RecentItem = {
  id: string
  title: string
  collection: 'pages' | 'posts'
  status: 'draft' | 'published'
  updatedAtLabel: string
  author?: { name: string }
}

const quickActions = [
  {
    title: 'Neue Seite',
    description: 'Visueller Page-Builder',
    icon: LayoutPanelTop,
  },
  {
    title: 'Neuer Beitrag',
    description: 'Blog-Artikel schreiben',
    icon: PenLine,
  },
  {
    title: 'Medien',
    description: 'Bibliothek verwalten',
    icon: ImageIcon,
  },
  {
    title: 'Website öffnen',
    description: 'Live-Vorschau',
    icon: ExternalLink,
    external: true,
  },
] as const

const recent: RecentItem[] = [
  {
    id: '1',
    title: 'Startseite',
    collection: 'pages',
    status: 'published',
    updatedAtLabel: 'vor 12 Min.',
    author: { name: 'Yousuf Navid' },
  },
  {
    id: '2',
    title: 'Studio Onboarding 2026',
    collection: 'posts',
    status: 'draft',
    updatedAtLabel: 'vor 38 Min.',
    author: { name: 'Anna Klein' },
  },
  {
    id: '3',
    title: 'Über uns',
    collection: 'pages',
    status: 'published',
    updatedAtLabel: 'vor 2 Std.',
    author: { name: 'Yousuf Navid' },
  },
  {
    id: '4',
    title: 'Press Kit — Q1 Release',
    collection: 'posts',
    status: 'draft',
    updatedAtLabel: 'vor 5 Std.',
    author: { name: 'Marco Vogt' },
  },
  {
    id: '5',
    title: 'Karriere',
    collection: 'pages',
    status: 'published',
    updatedAtLabel: 'gestern',
    author: { name: 'Anna Klein' },
  },
  {
    id: '6',
    title: 'Was ist neu in v3?',
    collection: 'posts',
    status: 'published',
    updatedAtLabel: 'vor 2 T.',
    author: { name: 'Yousuf Navid' },
  },
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const MockDashboard: React.FC<{ variantLabel?: string; className?: string }> = ({
  variantLabel,
  className,
}) => {
  return (
    <div className={cn('mx-auto w-full max-w-[1240px] px-6 py-8 lg:px-10 lg:py-10', className)}>
      {/* Greeting */}
      <header className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Hallo, Yousuf
            </h1>
            {variantLabel ? (
              <Badge variant="outline" className="ml-2 font-mono text-[10px] tracking-wider">
                {variantLabel}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Donnerstag, 28. Mai 2026</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Profil bearbeiten <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Quick actions */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Schnellzugriff
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.title}
                className="group relative h-full cursor-pointer overflow-hidden border-border bg-card p-5 shadow-none transition-all hover:border-foreground/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg border border-border bg-background p-2 transition-colors group-hover:border-foreground/40 group-hover:bg-foreground group-hover:text-background">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Recently edited */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Zuletzt bearbeitet
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Alle anzeigen <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <Card className="overflow-hidden border-border bg-card p-0 shadow-none">
          <ul className="divide-y divide-border">
            {recent.map((item) => (
              <li key={item.id}>
                <div className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:border-foreground/30 group-hover:text-foreground">
                    {item.collection === 'pages' ? (
                      <LayoutPanelTop className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <span className="hidden text-xs text-muted-foreground sm:inline">·</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {item.collection === 'pages' ? 'Seite' : 'Beitrag'}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{item.updatedAtLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.author?.name && (
                      <div className="hidden items-center gap-2 md:flex">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{initials(item.author.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{item.author.name}</span>
                      </div>
                    )}
                    <Badge
                      variant={item.status === 'published' ? 'outline' : 'muted'}
                      className={cn(
                        'gap-1 font-normal',
                        item.status === 'published'
                          ? 'border-foreground/15 text-foreground/80'
                          : 'text-muted-foreground',
                      )}
                    >
                      {item.status === 'published' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <CircleDashed className="h-3 w-3" />
                      )}
                      {item.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Separator className="my-10" />
        <p className="text-center text-xs text-muted-foreground">
          Studio · Mockup Preview · keine echten Daten
        </p>
      </section>
    </div>
  )
}

export default MockDashboard
