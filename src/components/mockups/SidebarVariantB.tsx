'use client'

import * as React from 'react'
import {
  ChevronDown,
  ChevronRight,
  CircleDashed,
  FileText,
  Globe,
  GripVertical,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  MoreHorizontal,
  PanelsTopLeft,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'

import { BrandMark, ThemeToggle } from './shared'

// --- mock content -----------------------------------------------------------

const pageTree = [
  {
    title: 'Startseite',
    children: [
      { title: 'Hero · Sommer 2026' },
      { title: 'Featured Stories' },
    ],
  },
  { title: 'Über uns' },
  { title: 'Karriere' },
  { title: 'Studio Onboarding' },
  { title: 'Press Kit' },
]

const recentPosts = [
  { title: 'Studio Onboarding 2026', status: 'draft' as const },
  { title: 'Press Kit — Q1 Release', status: 'draft' as const },
  { title: 'Was ist neu in v3?', status: 'published' as const },
  { title: 'Brand Refresh Notes', status: 'published' as const },
]

const favorites = [
  { label: 'Startseite', icon: PanelsTopLeft },
  { label: 'Studio Onboarding', icon: FileText },
  { label: 'Header Global', icon: LayoutPanelTop },
]

// --- atoms ------------------------------------------------------------------

const Row: React.FC<{
  active?: boolean
  depth?: number
  expandable?: boolean
  expanded?: boolean
  onToggle?: () => void
  icon?: React.ComponentType<{ className?: string }>
  label: string
  trailing?: React.ReactNode
  draggable?: boolean
}> = ({ active, depth = 0, expandable, expanded, onToggle, icon: Icon, label, trailing, draggable }) => {
  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md py-[5px] pr-1.5 text-[13px] transition-colors',
        active
          ? 'bg-accent font-medium text-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
      style={{ paddingLeft: 6 + depth * 14 }}
    >
      {draggable ? (
        <span className="invisible flex h-4 w-3 items-center justify-center text-muted-foreground/60 group-hover:visible">
          <GripVertical className="h-3 w-3" />
        </span>
      ) : null}
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      ) : (
        <span className="h-4 w-4 shrink-0" />
      )}
      {Icon ? (
        <Icon
          className={cn(
            'h-[14px] w-[14px] shrink-0 transition-colors',
            active ? 'text-foreground' : 'text-muted-foreground/80 group-hover:text-foreground',
          )}
        />
      ) : null}
      <span className="flex-1 truncate text-left">{label}</span>
      {trailing}
    </div>
  )
}

const GroupHeader: React.FC<{ label: string; onAdd?: () => void; addable?: boolean }> = ({
  label,
  addable,
}) => (
  <div className="group/header mt-3 flex items-center justify-between px-2 pb-1 pt-1">
    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
      {label}
    </p>
    {addable ? (
      <button
        type="button"
        className="invisible inline-flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground group-hover/header:visible"
      >
        <Plus className="h-3 w-3" />
      </button>
    ) : null}
  </div>
)

// --- main -------------------------------------------------------------------

const SidebarVariantB: React.FC = () => {
  const [pagesOpen, setPagesOpen] = React.useState(true)
  const [postsOpen, setPostsOpen] = React.useState(true)
  const [homepageOpen, setHomepageOpen] = React.useState(true)
  const [globalsOpen, setGlobalsOpen] = React.useState(true)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Workspace header */}
      <button
        type="button"
        className="group flex h-14 items-center gap-2.5 border-b border-border/70 px-3 text-left transition-colors hover:bg-accent/40"
      >
        <BrandMark size={26} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-none tracking-tight">
            Studio Workspace
          </p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">3 Mitglieder</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {/* Search */}
      <div className="px-3 pb-2 pt-3">
        <button
          type="button"
          className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate">Schnellsuche…</span>
        </button>
        <button
          type="button"
          className="mt-px flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate">Dashboard</span>
        </button>
      </div>

      {/* Body */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Favoriten */}
        <div className="group/header relative">
          <GroupHeader label="Favoriten" />
        </div>
        <ul className="space-y-px">
          {favorites.map((f) => (
            <li key={f.label}>
              <Row
                icon={f.icon}
                label={f.label}
                draggable
                trailing={
                  <Star className="h-3 w-3 fill-foreground/80 text-foreground/80 opacity-90" />
                }
              />
            </li>
          ))}
        </ul>

        {/* Workspace */}
        <GroupHeader label="Workspace" addable />

        {/* Pages — expandable tree */}
        <Row
          icon={PanelsTopLeft}
          label="Seiten"
          expandable
          expanded={pagesOpen}
          onToggle={() => setPagesOpen((v) => !v)}
          trailing={
            <button
              type="button"
              className="invisible inline-flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground group-hover:visible"
            >
              <Plus className="h-3 w-3" />
            </button>
          }
        />
        {pagesOpen ? (
          <ul className="space-y-px">
            {pageTree.map((page) => {
              const hasChildren = !!page.children?.length
              return (
                <li key={page.title}>
                  <Row
                    depth={1}
                    label={page.title}
                    draggable
                    icon={FileText}
                    expandable={hasChildren}
                    expanded={hasChildren ? homepageOpen : undefined}
                    onToggle={hasChildren ? () => setHomepageOpen((v) => !v) : undefined}
                    trailing={
                      <button
                        type="button"
                        className="invisible inline-flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground group-hover:visible"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    }
                  />
                  {hasChildren && homepageOpen ? (
                    <ul className="space-y-px">
                      {page.children!.map((child) => (
                        <li key={child.title}>
                          <Row
                            depth={2}
                            label={child.title}
                            draggable
                            icon={LayoutPanelTop}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}

        {/* Posts — expandable */}
        <Row
          icon={FileText}
          label="Beiträge"
          expandable
          expanded={postsOpen}
          onToggle={() => setPostsOpen((v) => !v)}
          trailing={
            <button
              type="button"
              className="invisible inline-flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground group-hover:visible"
            >
              <Plus className="h-3 w-3" />
            </button>
          }
        />
        {postsOpen ? (
          <ul className="space-y-px">
            {recentPosts.map((post) => (
              <li key={post.title}>
                <Row
                  depth={1}
                  label={post.title}
                  draggable
                  icon={FileText}
                  trailing={
                    post.status === 'draft' ? (
                      <CircleDashed className="h-3 w-3 text-muted-foreground/70" />
                    ) : null
                  }
                />
              </li>
            ))}
            <li>
              <Row
                depth={1}
                label="Alle Beiträge anzeigen"
                icon={ChevronRight}
              />
            </li>
          </ul>
        ) : null}

        <Row icon={ImageIcon} label="Medien" />
        <Row icon={Users} label="Nutzer" trailing={<Badge variant="muted" className="text-[10px]">3</Badge>} />

        {/* Globals */}
        <Row
          label="Globals"
          icon={Globe}
          expandable
          expanded={globalsOpen}
          onToggle={() => setGlobalsOpen((v) => !v)}
        />
        {globalsOpen ? (
          <ul className="space-y-px">
            <li><Row depth={1} icon={LayoutPanelTop} label="Header" /></li>
            <li><Row depth={1} icon={LayoutPanelTop} label="Footer" /></li>
          </ul>
        ) : null}

        {/* Settings */}
        <Row
          label="Einstellungen"
          icon={Settings}
          expandable
          expanded={settingsOpen}
          onToggle={() => setSettingsOpen((v) => !v)}
        />
        {settingsOpen ? (
          <ul className="space-y-px">
            <li><Row depth={1} icon={Globe} label="Redirects" /></li>
            <li><Row depth={1} icon={Search} label="Suche" /></li>
            <li><Row depth={1} icon={ShieldCheck} label="Passkeys" /></li>
            <li><Row depth={1} icon={Shield} label="2FA" /></li>
            <li><Row depth={1} icon={KeyRound} label="API Keys" /></li>
          </ul>
        ) : null}

        <div className="h-4" />
      </nav>

      <Separator className="opacity-60" />

      {/* Footer */}
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-accent"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-foreground text-[10px] text-background">YN</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium leading-none text-foreground">
              Yousuf Navid
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">Owner</p>
          </div>
        </button>
        <ThemeToggle compact />
        <button
          type="button"
          title="Abmelden"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}

export default SidebarVariantB
