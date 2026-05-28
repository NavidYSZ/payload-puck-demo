# Table Width Investigation — Payload Admin List Views

Symptom: on `/admin/collections/pages` and `/admin/collections/posts`, the list
card spans the full content area but columns cluster LEFT with whitespace right.

**Investigation constraint:** preview MCP could not attach (`preview_list` empty;
`.claude/launch.json` says port 3002 but Next is on port 3000, starting a new
server was disallowed). Better-auth's `/api/auth/sign-in/email` returns 404 to
curl, so I couldn't grab live DOM. All findings below are from static analysis
of Payload's source in `node_modules` plus the project's overrides.

---

## 1. Actual DOM (from `node_modules/@payloadcms/ui/dist/views/List/index.js` and `.../elements/Table/index.js`)

```html
<div class="collection-list collection-list--pages">
  <div class="gutter gutter--left gutter--right collection-list__wrap">
    <CollectionListHeader/> <ListControls/>
    <div class="collection-list__tables">  <!-- multi-table when grouping -->
      <div class="table">                  <!-- THIS is the wrap, NOT .table-wrap -->
        <table cellPadding="0" cellSpacing="0">
          <thead><tr><th id="heading-..." /></tr></thead>
          <tbody><tr class="row-1" data-id="..."><td class="cell-..." /></tr></tbody>
        </table>
      </div>
    </div>
    <PageControls/>
  </div>
</div>
```

Key facts:
- **No `.table-wrap` exists in the DOM.** Searching `node_modules/@payloadcms` for
  `table-wrap` in JS returns zero hits — it's only an orphan CSS selector in
  Payload's SCSS, never rendered.
- **No `<colgroup>` rendered.** Zero hits for `colgroup` in `@payloadcms/ui/dist`.
  Columns have no explicit widths.
- `pages` defaultColumns (`@delmaredigital/payload-puck/.../Pages.js:85`):
  `['title','slug','_status','updatedAt']` + auto `_select` = **5 cols**
- `posts` defaultColumns (`src/collections/Posts/index.ts:50`):
  `['title','slug','updatedAt']` + `_select` = **4 cols**

## 2. CSS that actually applies

**Payload stock** (`@layer payload-default`, `.../Table/index.scss`):
```scss
.table {
  overflow: auto;
  max-width: 100%;
  table { min-width: 100%; }
  th, td { min-width: 150px; padding: calc(var(--base) * 0.6); }
}
```

**Payload stock list-view** (`.../views/List/index.scss`):
```scss
.collection-list { width: 100%; }
.collection-list .table table { width: 100%; }
```

**Project overrides** (`src/app/(payload)/custom.scss`, unlayered — wins over
Payload's `@layer payload-default`):
```scss
/* line 587 — outer */
.collection-list { max-width: 1320px; padding: 32px 40px 48px !important; }

/* line 600 — gutter zeroed */
.collection-list .gutter { padding: 0 !important; }

/* line 653 — card framing TARGETS BOTH a real & a fake selector */
.collection-list__tables,        /* real, this gets the card border */
.collection-list .table-wrap     /* FAKE — element doesn't exist */
{ border-radius: 12px; border: 1px solid var(--theme-border-color); overflow: hidden; }

/* line 663 — also part-fake */
.collection-list table,          /* real */
.collection-list table.table,    /* fake — no JS adds .table class to <table> */
.table-wrap > table              /* fake */
{ width: 100%; border-collapse: separate; border-spacing: 0; }
```

`th, td { min-width: 150px }` from Payload is **never overridden** by the project.

Tailwind preflight: `table { border-collapse: collapse }` — overridden by the
custom rule above on `.collection-list table`.

## 3. Root cause

The table uses `table-layout: auto` (default — never set explicitly) with
`width: 100%` and every cell carrying `min-width: 150px` from Payload's stock
SCSS. With short demo content (5 columns × short strings + a status pill + a
date), the auto-layout algorithm sizes columns to their `max-content`, floored
at 150px each, then distributes any remaining slack only to the column with the
widest content (typically `title`).

At 1440px viewport: `1440 - 240 (sidebar) - 80 (collection-list h-padding) =
1120 px` effective content width. `5 × 150 = 750 px` minimum. Slack: ~370 px.
The `title` cell tends to absorb most of it.

But the visible card border comes from `.collection-list__tables` (with custom
border-radius + border), and `<table>` is positioned at `width: 100%` of the
wrap. Because `border-collapse: separate; border-spacing: 0` is set ONLY for the
non-existent `.table-wrap > table` and for `.collection-list table` (real), the
actual `<table>` rendered uses `border-collapse: separate; border-spacing: 0`.

The visual symptom — content clustered LEFT, whitespace RIGHT — is caused by
**`table-layout: auto` letting the table NOT honor `width: 100%` strictly when
column max-content widths are small.** The table renders at its preferred (max-
content) width, which is well under 1120px. The wrap `<div class="table">` IS
100% wide (block-level), so the `.collection-list__tables` card border shows
full width, but the `<table>` inside is short. That's the bug.

Verified contributor: `min-width: 100%` from Payload's stock `.table table { min-
width: 100% }` IS overridden by the custom `width: 100%`. Without `min-width:
100%`, Chromium will let an auto-layout table shrink below 100% if content
permits.

## 4. How shadcn / Linear / Vercel / Notion solve this

shadcn `Table` primitive (`mcp__Shadcn_UI__get_component table`): wraps `<table
className="w-full caption-bottom text-sm">` in `<div className="relative w-full
overflow-x-auto">`. Sets `whitespace-nowrap` on `<th>` and `<td>` — defers
column-width control to the consumer. Its DataTable demo uses TanStack Table and
**also doesn't enforce filling** — relies on consumers applying per-column
`className="w-[Npx]"` or `flex-1`.

Linear / Vercel / Notion typically use `table-layout: fixed` with explicit
percentage / pixel widths via `<colgroup>` OR ditch `<table>` for CSS grid.
Common ratios for a CMS list view:

| Column         | Width            |
|----------------|------------------|
| `_select`      | 40px fixed       |
| `title`        | `auto` / flex-1  |
| `slug`         | 25% or 220px     |
| `_status` pill | 100px fixed      |
| `updatedAt`    | 160px fixed, R-aligned |

With `table-layout: fixed`, columns without explicit widths absorb the slack.

## 5. Secondary findings (worth flagging but not the bug)

- `.collection-list` max-width 1320px vs Dashboard's `max-w-[1240px]`
  (`src/components/admin/Dashboard.tsx:149`) — inconsistent shell width
- Custom CSS card-border selector `.collection-list .table-wrap` is a no-op
- `.collection-list table.table` selector is also a no-op (`<table>` has no
  `.table` class; the WRAP has `.table`)
- `min-width: 150px` on every cell is preserved from Payload stock — limits
  responsive narrowing below ~750px content

## 6. Files relevant to a future fix

- **Primary:** `src/app/(payload)/custom.scss` lines 651–712 (the table block)
- For the fixed-layout / colgroup option, may need a `Table` server component
  override in `payload.config.ts > admin.components.elements.Table` mapping to
  a custom component that injects `<colgroup>`. No such override exists today;
  Payload defaults to `@payloadcms/ui/.../Table` from `views/List/index.js:194`.
- Sidebar width is `w-[240px]` (`src/components/admin/SidebarNavClient.tsx:176`)
