'use client'

import * as React from 'react'
import {
  ChevronDown,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  Lock,
  PanelsTopLeft,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SquarePen,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'

import { BrandMark, Kbd, ThemeToggle } from './shared'

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  active?: boolean
  badge?: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    label: 'Übersicht',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, active: true }],
  },
  {
    label: 'Content',
    items: [
      { label: 'Seiten', icon: PanelsTopLeft, badge: '24' },
      { label: 'Beiträge', icon: FileText, badge: '12' },
      { label: 'Medien', icon: ImageIcon },
      { label: 'Nutzer', icon: Users },
    ],
  },
  {
    label: 'Globals',
    items: [
      { label: 'Header', icon: LayoutPanelTop },
      { label: 'Footer', icon: LayoutPanelTop },
    ],
  },
  {
    label: 'Einstellungen',
    items: [
      { label: 'Redirects', icon: Globe },
      { label: 'Suche', icon: Search },
      { label: 'Passkeys', icon: ShieldCheck },
      { label: '2FA', icon: Shield },
      { label: 'API Keys', icon: KeyRound },
    ],
  },
]

const SidebarVariantA: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Top — brand */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <BrandMark size={26} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-none tracking-tight">Studio</p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">visable.io</p>
        </div>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Workspace wechseln"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <button
          type="button"
          className="group flex w-full items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-background hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate">Suchen…</span>
          <span className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      {/* Primary actions */}
      <div className="px-3 pb-2">
        <button
          type="button"
          className="group inline-flex w-full items-center gap-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
        >
          <SquarePen className="h-3.5 w-3.5" />
          <span>Neu erstellen</span>
        </button>
      </div>

      <Separator className="my-1 opacity-60" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {groups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && 'mt-4')}>
            <p className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="space-y-px">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      className={cn(
                        'group flex w-full items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] transition-colors',
                        item.active
                          ? 'bg-accent font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-[15px] w-[15px] shrink-0 transition-colors',
                          item.active
                            ? 'text-foreground'
                            : 'text-muted-foreground/80 group-hover:text-foreground',
                        )}
                      />
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded bg-muted px-1.5 py-px font-mono text-[10px] text-muted-foreground">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — user card */}
      <div className="relative border-t border-border p-2">
        {menuOpen ? (
          <div className="absolute bottom-[58px] left-2 right-2 z-10 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-3.5 w-3.5" /> Einstellungen
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Lock className="h-3.5 w-3.5" /> Passwort ändern
            </button>
            <Separator className="my-1" />
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Abmelden
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="group flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-accent"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-foreground text-[10px] text-background">YN</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium leading-none text-foreground">
              Yousuf Navid
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">ynavid@icloud.com</p>
          </div>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
              menuOpen && 'rotate-180',
            )}
          />
        </button>
        <div className="mt-1 flex items-center justify-end">
          <ThemeToggle compact />
        </div>
      </div>
    </aside>
  )
}

export default SidebarVariantA
