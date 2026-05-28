'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronDown,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  Moon,
  Network,
  PanelsTopLeft,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SquarePen,
  Sun,
  User as UserIcon,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'
import { authClient } from '@/lib/auth/client'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  pages: PanelsTopLeft,
  posts: FileText,
  media: ImageIcon,
  users: Users,
  redirects: Globe,
  search: Search,
  pageTree: Network,
  passkeys: ShieldCheck,
  twoFactor: Shield,
  apiKeys: KeyRound,
  global: LayoutPanelTop,
}

export type SidebarItem = {
  label: string
  href: string
  iconKey: string
  matchExact?: boolean
  badge?: string | number
}

export type SidebarSection = {
  label: string
  items: SidebarItem[]
}

export type SidebarUser = {
  name: string
  email: string
  initials: string
}

export type SidebarBrand = {
  name: string
  subtitle?: string
}

type Props = {
  sections: SidebarSection[]
  user: SidebarUser | null
  adminRoute: string
  brand: SidebarBrand
}

function useActive(href: string, exact?: boolean) {
  const pathname = usePathname() || ''
  if (exact) return pathname === href || pathname === href + '/'
  return pathname === href || pathname.startsWith(href + '/')
}

const NavRow: React.FC<{ item: SidebarItem }> = ({ item }) => {
  const Icon = ICON_MAP[item.iconKey] || LayoutPanelTop
  const active = useActive(item.href, item.matchExact)
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] transition-colors',
        active
          ? 'bg-accent font-medium text-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-[15px] w-[15px] shrink-0 transition-colors',
          active ? 'text-foreground' : 'text-muted-foreground/80 group-hover:text-foreground',
        )}
      />
      <span className="flex-1 truncate text-left">{item.label}</span>
      {item.badge ? (
        <span className="rounded bg-muted px-1.5 py-px font-mono text-[10px] text-muted-foreground">
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

const ThemeButton: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const root = document.documentElement
    setIsDark(root.dataset.theme === 'dark')
  }, [])

  const toggle = React.useCallback(() => {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      document.cookie = `payload-theme=${next}; path=/; max-age=31536000; samesite=lax`
    } catch {}
    setIsDark(next === 'dark')
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

const SidebarNavClient: React.FC<Props> = ({ sections, user, adminRoute, brand }) => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [menuOpen])

  const handleSignOut = React.useCallback(async () => {
    try {
      await authClient.signOut()
    } catch (e) {
      // best-effort — still attempt redirect
    }
    router.push(`${adminRoute}/login`)
    router.refresh()
  }, [router, adminRoute])

  return (
    <aside className="admin-shell flex h-screen w-[240px] shrink-0 flex-col border-r border-border bg-background text-foreground">
      {/* Top — brand */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <BrandMark size={26} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-none tracking-tight">
            {brand.name}
          </p>
          {brand.subtitle ? (
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{brand.subtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Workspace"
          aria-label="Workspace switcher"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search affordance — opens nothing yet, just a visual hint for ⌘K */}
      <div className="px-3 pb-3">
        <button
          type="button"
          className="group flex w-full items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-background hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate">Suchen…</span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘
            </kbd>
            <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              K
            </kbd>
          </span>
        </button>
      </div>

      {/* Primary CTA */}
      <div className="px-3 pb-2">
        <Link
          href={`${adminRoute}/page-tree`}
          className="group inline-flex w-full items-center gap-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
        >
          <SquarePen className="h-3.5 w-3.5" />
          <span>Neu erstellen</span>
        </Link>
      </div>

      <Separator className="my-1 opacity-60" />

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {sections.map((section, gi) => (
          <div key={section.label} className={cn(gi > 0 && 'mt-4')}>
            <p className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
              {section.label}
            </p>
            <ul className="space-y-px">
              {section.items.map((item) => (
                <li key={`${section.label}-${item.href}`}>
                  <NavRow item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — user card + theme toggle */}
      {user ? (
        <div className="relative border-t border-border p-2" ref={menuRef}>
          {menuOpen ? (
            <div className="absolute bottom-[58px] left-2 right-2 z-10 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg">
              <Link
                href={`${adminRoute}/account`}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <UserIcon className="h-3.5 w-3.5" /> Profil
              </Link>
              <Link
                href={`${adminRoute}/security/passkeys`}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Sicherheit
              </Link>
              <Separator className="my-1" />
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Abmelden
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="group flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-accent"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-foreground text-[10px] text-background">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium leading-none text-foreground">
                {user.name}
              </p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{user.email}</p>
            </div>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
                menuOpen && 'rotate-180',
              )}
            />
          </button>
          <div className="mt-1 flex items-center justify-end">
            <ThemeButton />
          </div>
        </div>
      ) : null}
    </aside>
  )
}

const BrandMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <div
    className="inline-flex items-center justify-center rounded-[7px] bg-foreground text-background"
    style={{ width: size, height: size }}
    aria-hidden
  >
    <svg
      width={Math.round(size * 0.55)}
      height={Math.round(size * 0.55)}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3 3.5 H8.6 C11.3 3.5 13.5 5.7 13.5 8.4 C13.5 11.1 11.3 13.3 8.6 13.3 H3 Z M5.5 5.9 V10.9 H8.6 C10 10.9 11.1 9.8 11.1 8.4 C11.1 7 10 5.9 8.6 5.9 Z"
        fill="currentColor"
      />
    </svg>
  </div>
)

export default SidebarNavClient
