'use client'

import * as React from 'react'
import {
  ChevronRight,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  PenLine,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'

import { BrandMark, Kbd, ThemeToggle } from './shared'

type RailItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  letter?: string
  active?: boolean
  /** small status indicator next to the icon */
  dot?: 'draft' | 'unread' | null
  group?: string
}

const sections: { label: string; items: RailItem[] }[] = [
  {
    label: 'Übersicht',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, letter: 'D', active: true }],
  },
  {
    label: 'Content',
    items: [
      { label: 'Seiten', icon: PanelsTopLeft, letter: 'P', dot: 'draft' },
      { label: 'Beiträge', icon: FileText, letter: 'B', dot: 'draft' },
      { label: 'Medien', icon: ImageIcon, letter: 'M' },
      { label: 'Nutzer', icon: Users, letter: 'U' },
    ],
  },
  {
    label: 'Globals',
    items: [
      { label: 'Header', icon: LayoutPanelTop, letter: 'H' },
      { label: 'Footer', icon: LayoutPanelTop, letter: 'F' },
    ],
  },
  {
    label: 'Einstellungen',
    items: [
      { label: 'Redirects', icon: Globe, letter: 'R' },
      { label: 'Suche', icon: Search, letter: 'S' },
      { label: 'Passkeys', icon: ShieldCheck, letter: 'K' },
      { label: '2FA', icon: Shield, letter: '2' },
      { label: 'API Keys', icon: KeyRound, letter: 'A' },
    ],
  },
]

const Dot: React.FC<{ kind: 'draft' | 'unread' }> = ({ kind }) => (
  <span
    className={cn(
      'absolute right-1 top-1 inline-block h-1.5 w-1.5 rounded-full ring-2 ring-sidebar',
      kind === 'draft' ? 'bg-foreground/60' : 'bg-foreground',
    )}
    aria-hidden
  />
)

const SidebarVariantC: React.FC = () => {
  const [pinned, setPinned] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const expanded = pinned || hovered

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group/rail relative flex h-screen shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out',
        expanded ? 'w-[240px]' : 'w-[60px]',
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center px-3">
        <div className="flex h-10 w-9 shrink-0 items-center justify-center">
          <BrandMark size={26} />
        </div>
        <div
          className={cn(
            'min-w-0 overflow-hidden transition-opacity',
            expanded ? 'opacity-100 duration-200 delay-75' : 'pointer-events-none opacity-0 duration-100',
          )}
        >
          <p className="truncate text-[13px] font-semibold leading-none tracking-tight">Studio</p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">visable.io</p>
        </div>
      </div>

      {/* Primary actions */}
      <div className={cn('px-2 pb-1', !expanded && 'px-2.5')}>
        <button
          type="button"
          title={!expanded ? 'Neu erstellen' : undefined}
          className={cn(
            'group/btn relative flex items-center rounded-md bg-foreground text-background transition-colors hover:opacity-90',
            expanded ? 'w-full justify-start gap-2 px-2.5 py-1.5 text-xs font-medium' : 'h-9 w-9 justify-center',
          )}
        >
          <PenLine className="h-4 w-4 shrink-0" />
          <span
            className={cn(
              'overflow-hidden transition-opacity',
              expanded ? 'opacity-100 duration-200 delay-75' : 'pointer-events-none w-0 opacity-0',
            )}
          >
            Neu erstellen
          </span>
        </button>

        <button
          type="button"
          title={!expanded ? 'Suchen — ⌘K' : undefined}
          className={cn(
            'group/btn mt-1 flex items-center rounded-md border border-border bg-background/40 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-background hover:text-foreground',
            expanded ? 'w-full justify-start gap-2 px-2.5 py-1.5' : 'h-9 w-9 justify-center',
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span
            className={cn(
              'flex flex-1 items-center gap-2 overflow-hidden transition-opacity',
              expanded ? 'opacity-100 duration-200 delay-75' : 'pointer-events-none w-0 opacity-0',
            )}
          >
            <span className="flex-1 truncate text-left">Suchen…</span>
            <span className="flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </span>
        </button>
      </div>

      <Separator className="my-2 opacity-60" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {sections.map((section, si) => (
          <div key={section.label} className={cn(si > 0 && 'mt-3')}>
            <p
              className={cn(
                'overflow-hidden px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70 transition-opacity',
                expanded ? 'opacity-100 duration-200 delay-75' : 'h-0 pb-0 pt-0 opacity-0',
              )}
            >
              {section.label}
            </p>
            <ul className="space-y-px">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label} className="group/item relative">
                    <button
                      type="button"
                      className={cn(
                        'relative flex w-full items-center rounded-md text-[13px] transition-colors',
                        expanded ? 'gap-2.5 px-2 py-[7px]' : 'h-9 justify-center',
                        item.active
                          ? 'bg-accent font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                      )}
                    >
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <Icon
                          className={cn(
                            'h-[15px] w-[15px] transition-colors',
                            item.active
                              ? 'text-foreground'
                              : 'text-muted-foreground/80 group-hover/item:text-foreground',
                          )}
                        />
                        {item.dot && !expanded ? <Dot kind={item.dot} /> : null}
                      </span>
                      <span
                        className={cn(
                          'flex-1 truncate text-left transition-opacity',
                          expanded ? 'opacity-100 duration-200 delay-75' : 'pointer-events-none w-0 opacity-0',
                        )}
                      >
                        {item.label}
                      </span>
                      {item.dot && expanded ? (
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            item.dot === 'draft' ? 'bg-foreground/60' : 'bg-foreground',
                          )}
                        />
                      ) : null}
                    </button>

                    {/* Collapsed tooltip */}
                    {!expanded ? (
                      <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/item:opacity-100">
                        {item.label}
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Separator className="opacity-60" />

      {/* Footer */}
      <div className={cn('flex flex-col gap-1 p-2', !expanded && 'items-center')}>
        {/* Pin toggle */}
        <button
          type="button"
          onClick={() => setPinned((v) => !v)}
          title={pinned ? 'Sidebar einklappen' : 'Sidebar anpinnen'}
          className={cn(
            'group/pin relative flex items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            expanded ? 'w-full justify-start gap-2.5 px-2 py-1.5 text-[12px]' : 'h-9 w-9 justify-center',
          )}
        >
          {pinned ? (
            <PanelLeftClose className="h-4 w-4 shrink-0" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          )}
          <span
            className={cn(
              'overflow-hidden transition-opacity',
              expanded ? 'opacity-100 duration-200 delay-75' : 'pointer-events-none w-0 opacity-0',
            )}
          >
            {pinned ? 'Einklappen' : 'Anpinnen'}
          </span>
        </button>

        {/* Theme toggle (always visible) */}
        <ThemeToggle compact className={cn(!expanded && 'self-center')} />

        {/* User */}
        <button
          type="button"
          title={!expanded ? 'Yousuf Navid · Konto' : undefined}
          className={cn(
            'group/user relative flex items-center rounded-md transition-colors hover:bg-accent',
            expanded ? 'w-full gap-2.5 px-1.5 py-1.5' : 'h-9 w-9 justify-center',
          )}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-foreground text-[10px] text-background">YN</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'min-w-0 flex-1 overflow-hidden text-left transition-opacity',
              expanded ? 'opacity-100 duration-200 delay-75' : 'pointer-events-none w-0 opacity-0',
            )}
          >
            <p className="truncate text-[12px] font-medium leading-none text-foreground">
              Yousuf Navid
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">ynavid@icloud.com</p>
          </div>
          {expanded ? (
            <LogOut className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover/user:text-foreground" />
          ) : null}
          {!expanded ? (
            <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/user:opacity-100">
              Yousuf Navid · Konto
            </span>
          ) : null}
        </button>
      </div>
    </aside>
  )
}

export default SidebarVariantC
