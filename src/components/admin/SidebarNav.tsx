import type { ServerProps } from 'payload'
import Link from 'next/link'
import {
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutPanelTop,
  PanelsTopLeft,
  Search,
  Shield,
  ShieldCheck,
  SquarePen,
  Users,
} from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import SidebarNavClient, { type SidebarSection } from './SidebarNavClient'

const COLLECTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pages: PanelsTopLeft,
  posts: FileText,
  media: ImageIcon,
  users: Users,
  redirects: Globe,
  search: Search,
}

const COLLECTION_LABEL: Record<string, string> = {
  pages: 'Seiten',
  posts: 'Beiträge',
  media: 'Medien',
  users: 'Nutzer',
  redirects: 'Redirects',
  search: 'Suche',
}

// Which collection slugs belong in the "Content" vs "Einstellungen" sections.
// Anything not listed is hidden from the sidebar.
const CONTENT_SLUGS = new Set(['pages', 'posts', 'media', 'users'])
const SETTINGS_SLUGS = new Set(['redirects', 'search'])

const SidebarNav: React.FC<ServerProps> = async (props) => {
  const { payload, user, visibleEntities } = props
  if (!payload?.config) return null

  const adminRoute = payload.config.routes?.admin || '/admin'

  const visibleCollectionSlugs = new Set(visibleEntities?.collections || [])
  const visibleGlobalSlugs = new Set(visibleEntities?.globals || [])

  const collections = payload.config.collections.filter(
    (c) => visibleCollectionSlugs.has(c.slug) && !c.admin?.hidden,
  )
  const globals = payload.config.globals.filter(
    (g) => visibleGlobalSlugs.has(g.slug) && !g.admin?.hidden,
  )

  const contentItems = collections
    .filter((c) => CONTENT_SLUGS.has(c.slug))
    .map((c) => ({
      label: COLLECTION_LABEL[c.slug] || c.slug,
      href: `${adminRoute}/collections/${c.slug}`,
      iconKey: c.slug,
    }))

  const globalsItems = globals.map((g) => ({
    label:
      typeof g.label === 'string'
        ? g.label
        : (g.label as { de?: string; en?: string })?.de ||
          (g.label as { de?: string; en?: string })?.en ||
          g.slug,
    href: `${adminRoute}/globals/${g.slug}`,
    iconKey: 'global',
  }))

  const settingsItems = [
    ...collections
      .filter((c) => SETTINGS_SLUGS.has(c.slug))
      .map((c) => ({
        label: COLLECTION_LABEL[c.slug] || c.slug,
        href: `${adminRoute}/collections/${c.slug}`,
        iconKey: c.slug,
      })),
    {
      label: 'Page Tree',
      href: `${adminRoute}/page-tree`,
      iconKey: 'pageTree',
    },
    { label: 'Passkeys', href: `${adminRoute}/security/passkeys`, iconKey: 'passkeys' },
    { label: '2FA', href: `${adminRoute}/security/two-factor`, iconKey: 'twoFactor' },
    { label: 'API Keys', href: `${adminRoute}/security/api-keys`, iconKey: 'apiKeys' },
  ]

  const sections: SidebarSection[] = [
    {
      label: 'Übersicht',
      items: [
        {
          label: 'Dashboard',
          href: adminRoute,
          iconKey: 'dashboard',
          matchExact: true,
        },
      ],
    },
    { label: 'Content', items: contentItems },
    ...(globalsItems.length ? [{ label: 'Globals', items: globalsItems }] : []),
    { label: 'Einstellungen', items: settingsItems },
  ]

  const userPayload = user
    ? {
        name: (user as { name?: string }).name || user.email?.split('@')[0] || 'Nutzer',
        email: user.email || '',
        initials: (() => {
          const name = (user as { name?: string }).name
          if (name) {
            const parts = name.trim().split(/\s+/)
            if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          }
          return user.email?.slice(0, 2).toUpperCase() || '??'
        })(),
      }
    : null

  return (
    <SidebarNavClient
      sections={sections}
      user={userPayload}
      adminRoute={adminRoute}
      brand={{ name: 'Studio', subtitle: 'visable.io' }}
    />
  )
}

export default SidebarNav

// Re-export so consumers can derive props without re-importing the helpers
export type { SidebarSection }
