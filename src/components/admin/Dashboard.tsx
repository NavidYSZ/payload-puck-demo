import type { AdminViewServerProps } from 'payload'
import Link from 'next/link'
import {
  FileText,
  Image as ImageIcon,
  LayoutPanelTop,
  ExternalLink,
  ArrowRight,
  Plus,
  PenLine,
  Clock,
  CheckCircle2,
  CircleDashed,
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getServerSideURL } from '@/utilities/getURL'

type RecentItem = {
  id: string | number
  title: string
  collection: 'pages' | 'posts'
  status: 'draft' | 'published'
  updatedAt: string
  author?: { name?: string | null; email?: string | null } | null
}

function initials(input?: string | null) {
  if (!input) return '?'
  const parts = input.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function relativeTime(iso: string) {
  const date = new Date(iso)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'gerade eben'
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`
  if (diff < 604800) return `vor ${Math.floor(diff / 86400)} T.`
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

const Dashboard: React.FC<AdminViewServerProps> = async (props) => {
  const { req } = props.initPageResult
  const payload = req.payload
  const user = req.user

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 11) return 'Guten Morgen'
    if (h < 17) return 'Hallo'
    return 'Guten Abend'
  })()

  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Fetch recent content from both collections in parallel
  const [postsRes, pagesRes] = await Promise.all([
    payload
      .find({
        collection: 'posts',
        limit: 6,
        sort: '-updatedAt',
        depth: 1,
        overrideAccess: false,
        user,
      })
      .catch(() => ({ docs: [] as any[] })),
    payload
      .find({
        collection: 'pages' as any,
        limit: 6,
        sort: '-updatedAt',
        depth: 1,
        overrideAccess: false,
        user,
      })
      .catch(() => ({ docs: [] as any[] })),
  ])

  const recent: RecentItem[] = [
    ...postsRes.docs.map((d: any) => ({
      id: d.id,
      title: d.title || 'Ohne Titel',
      collection: 'posts' as const,
      status: (d._status === 'published' || d.published === true ? 'published' : 'draft') as
        | 'draft'
        | 'published',
      updatedAt: d.updatedAt,
      author: Array.isArray(d.authors) ? d.authors[0] : d.author || null,
    })),
    ...pagesRes.docs.map((d: any) => ({
      id: d.id,
      title: d.title || d.pageSegment || 'Ohne Titel',
      collection: 'pages' as const,
      status: (d._status === 'published' || d.published === true ? 'published' : 'draft') as
        | 'draft'
        | 'published',
      updatedAt: d.updatedAt,
      author: null,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)

  const siteURL = getServerSideURL()

  const quickActions = [
    {
      title: 'Neue Seite',
      description: 'Visueller Page-Builder',
      href: '/admin/page-tree',
      icon: LayoutPanelTop,
    },
    {
      title: 'Neuer Beitrag',
      description: 'Blog-Artikel schreiben',
      href: '/admin/collections/posts/create',
      icon: PenLine,
    },
    {
      title: 'Medien',
      description: 'Bibliothek verwalten',
      href: '/admin/collections/media',
      icon: ImageIcon,
    },
    {
      title: 'Website öffnen',
      description: 'Live-Vorschau',
      href: siteURL || '/',
      icon: ExternalLink,
      external: true,
    },
  ]

  const userName = (user as any)?.name || user?.email?.split('@')[0] || 'dort'

  return (
    <div className="dashboard-shell mx-auto w-full max-w-[1240px] px-6 py-8 lg:px-10 lg:py-10">
      {/* Greeting */}
      <header className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {userName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        <Link
          href="/admin/account"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Profil bearbeiten <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
            const card = (
              <Card className="group relative h-full overflow-hidden border-border bg-card p-5 shadow-none transition-all hover:border-foreground/30 hover:shadow-sm">
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
            return action.external ? (
              <a
                key={action.title}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {card}
              </a>
            ) : (
              <Link key={action.title} href={action.href} className="block">
                {card}
              </Link>
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
          <Link
            href="/admin/page-tree"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Alle anzeigen <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <Card className="overflow-hidden border-border bg-card p-0 shadow-none">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">Noch keine Inhalte</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Leg los und erstelle deine erste Seite oder einen Beitrag.
              </p>
              <Link
                href="/admin/page-tree"
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Neue Seite
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((item) => {
                const editHref =
                  item.collection === 'pages'
                    ? `/admin/collections/pages/${item.id}`
                    : `/admin/collections/posts/${item.id}`
                return (
                  <li key={`${item.collection}-${item.id}`}>
                    <Link
                      href={editHref}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:border-foreground/30 group-hover:text-foreground">
                        {item.collection === 'pages' ? (
                          <LayoutPanelTop className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.title}
                          </p>
                          <span className="hidden text-xs text-muted-foreground sm:inline">·</span>
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            {item.collection === 'pages' ? 'Seite' : 'Beitrag'}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{relativeTime(item.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.author?.name && (
                          <div className="hidden items-center gap-2 md:flex">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{initials(item.author.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {item.author.name}
                            </span>
                          </div>
                        )}
                        <Badge
                          variant={item.status === 'published' ? 'success' : 'muted'}
                          className="gap-1"
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
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* Footer hint */}
      <Separator className="my-10" />
      <p className="text-center text-xs text-muted-foreground">
        Studio · Payload {payload.config.admin?.meta?.titleSuffix || ''}
      </p>
    </div>
  )
}

export default Dashboard
