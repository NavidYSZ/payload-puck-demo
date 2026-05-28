# Session Log

> Lebendige Projektzusammenfassung. Was gebaut wurde, welche Entscheidungen getroffen sind, was als nächstes kommt.

Stand: **2026-05-28**

---

## Drei-Phasen-Plan

**Phase 1 — Backend modernisieren** ✅ Großteil fertig (diese Session)
**Phase 2 — Puck Visual Builder überarbeiten** 🕓 Geplant nach Phase-1-Abschluss
**Phase 3 — KI-Layer** 🔮 Zukunftsmusik (Erste Notizen in `AI_INTEGRATION.md`)

---

## Setup-Stand

- Template: geklont von `delmaredigital/dd-starter` (Payload CMS 3 + Puck + Page Tree + Better Auth)
- Postgres lokal via Docker: Container `payloadpuckdemo-postgres-1`, Port `54320`, DB `ddstarter`
- Stack: Next.js 16 (App Router, Turbopack), React 19, Payload 3.84, Tailwind v4, shadcn/ui, Geist Font
- Dev-Server: `pnpm dev` (HTTPS-Cert fällt evtl. auf HTTP zurück); aktuell auf Port 3002
- Type-Check: `pnpm check`
- Test-Admin (lokal): `dashboard-test@local.dev` / `DashboardTest_2026!` (role=admin, User ID 2)

---

## Phase 1 — Was diese Session passiert ist

### Style-Entscheidung
Neutrale Palette (schwarz/weiß/grau, Linear/Vercel-Vibe). Indigo/Violett-Theme der vorherigen Iteration **verworfen**. Keine bunten Akzente, keine Gradients.

### Custom Admin-Theme
- [src/app/(payload)/custom.scss](../src/app/(payload)/custom.scss) — komplett neu geschrieben:
  - Voller `@import 'tailwindcss'` (split-imports liefern keine arbitrary-values)
  - oklch-Palette neutral, light + dark mode, shadcn-Tokens + Payload `--theme-*` Tokens
  - `.template-default` von `display:grid` auf `display:flex` umgestellt — sonst landet die Sidebar in einer 0px-Spalte
  - Stock-AppHeader hidden (war redundant + zeigte falschen Avatar)
  - Preflight-Casualties manuell repariert: Buttons, Inputs, Checkboxen, Radios, Tabellen, Pagination
  - Scoped Reset in `@layer base` damit Tailwind-Utilities (`@layer utilities`) gewinnen
  - Tabellen: `table-layout: fixed` + explizite Widths pro Accessor (Status 130, Email 280, Date 180, Slug 220, Title flext)
  - Wrapper-Fix: `.collection-list__tables > .table { width: 100% }` weil Payload das `<table>` in einen extra `<div class="table">` mit `display:table` wrappt

### Custom Komponenten
- [src/components/admin/Logo.tsx](../src/components/admin/Logo.tsx) + [Icon.tsx](../src/components/admin/Icon.tsx) — monochrome Mark (currentColor)
- [src/components/admin/Dashboard.tsx](../src/components/admin/Dashboard.tsx) — Custom Dashboard-View. Greeting + Quick-Actions + "Zuletzt bearbeitet"-Liste. KEINE KPI-Cards (User-Wunsch: WordPress-Vibe).
- [src/components/admin/SidebarNav.tsx](../src/components/admin/SidebarNav.tsx) (Server) + [SidebarNavClient.tsx](../src/components/admin/SidebarNavClient.tsx) (Client) — Linear-modern Sidebar mit Workspace-Card, ⌘K-Suchfeld (visual only), schwarzer "Neu erstellen" CTA, gruppierte Sections (Übersicht/Content/Globals/Einstellungen), User-Card mit Dropdown unten

### Neue shadcn-Primitives
- [src/components/ui/badge.tsx](../src/components/ui/badge.tsx)
- [src/components/ui/separator.tsx](../src/components/ui/separator.tsx)
- [src/components/ui/avatar.tsx](../src/components/ui/avatar.tsx)

### Sidebar-Mockup-Varianten (Design-Exploration)
Drei Live-Mockups unter `/admin-mockups/v{1,2,3}` als Vergleichsbasis:
- **V1 — Linear-modern** (gewählt) — siehe `src/components/mockups/SidebarVariantA.tsx`
- V2 — Notion-workspace — tree-style, expandable Pages
- V3 — Icon-rail — 60px collapsed, expand on hover
- Index + README: `src/app/(mockups)/admin-mockups/page.tsx`, `src/app/(mockups)/README.md`

### Plugin-Config-Änderung
- `afterLoginPath` in [src/plugins/index.ts](../src/plugins/index.ts) von `/admin/page-tree` auf `/admin` umgestellt → Dashboard ist jetzt Landing-Page nach Login.

### UI-Audit + Tabellen-Investigation
- [docs/UI_AUDIT.md](./UI_AUDIT.md) — 18 Findings (5 Critical, 8 Major, 4 Minor, 2 Inconsistency) vom Subagent durchgegangen. Alle 5 Critical sind fixed, die meisten Major auch.
- [docs/TABLE_WIDTH_INVESTIGATION.md](./TABLE_WIDTH_INVESTIGATION.md) — tiefe Analyse warum Tabellen die Wrap-Breite nicht füllten, mit Trade-off-Vergleich von 4 Lösungswegen. Gewählt: Option A (table-layout:fixed + per-accessor widths).

---

## Erledigt vs. offen

**Erledigt ✅**
- Custom neutrale Theme (light + dark)
- Custom Sidebar (Linear-modern)
- Custom Dashboard
- AppHeader weg
- Preflight-Repairs für Forms/Tabellen/Buttons
- List-Views haben Dashboard-Proportionen (40px Gutter, 28px Titel, Card-Table)
- Tabellen-Spaltenbreiten konsistent über Collections

**Offen (kleinere Polish-Themen für Phase-1-Finishing)**
- Page Tree Plugin (`/admin/page-tree`) hat eigene grüne CTAs — nicht in unserem Style
- Dashboard-Footer zeigt "Studio · Payload - Payload" (doppeltes "Payload" durch `titleSuffix`)
- ⌘K-Suchfeld in der Sidebar ist nur visual, keine echte Command-Palette dahinter
- 2FA / Passkeys / API-Keys Edit-Views noch nicht alle einzeln durchgegangen
- Dark-Mode quer durchklicken auf alle Pages

---

## Nächste Schritte (vom User noch zu spezifizieren)

1. Phase 1 Finishing: kleinere Polish-Tasks oben aus "Offen"-Liste
2. Phase 2 starten: Puck Visual Editor in den gleichen Stil bringen
3. (Später) Phase 3: KI-Layer auf Payload REST + Better Auth API Keys

---

## Referenzdateien

- [UI_AUDIT.md](./UI_AUDIT.md) — Audit-Report mit Findings nach Severity
- [TABLE_WIDTH_INVESTIGATION.md](./TABLE_WIDTH_INVESTIGATION.md) — Tabellen-Width Trade-off-Analyse
- [AI_INTEGRATION.md](./AI_INTEGRATION.md) — Notizen + Code-Skeletons für Phase 3
- [EDITOR_OPTIONS.md](./EDITOR_OPTIONS.md) — Editor-Vergleich (Puck vs. GrapesJS vs. Eigenbau)
- [../src/app/(mockups)/README.md](../src/app/(mockups)/README.md) — Sidebar-Mockup-Variants
