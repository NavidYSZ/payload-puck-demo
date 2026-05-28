# UI/UX Audit — Payload Admin (Phase 2 follow-up)

Date: 2026-05-28
Viewport: 1440x900
Auth user: dashboard-test@local.dev (role=admin)

## Severity legend
- Critical — breaks usability or looks clearly broken
- Major — noticeable visual defect that hurts polish
- Minor — small spacing/alignment issue
- Inconsistency — works but doesn't match the visual language

## Findings by page

### Global (visible on every admin page)

- **Critical — Custom sidebar is invisible on every page.**
  - Where: `aside.admin-shell` (240px wide) sits as the first child of `.template-default` (CSS `display: grid`). The computed `grid-template-columns` is `0px 1440px` — Payload's stock template CSS sized the first track to 0 because our sidebar isn't its built-in `<nav>`. The second child `.template-default__wrap` therefore covers the full 1440px viewport with a white background (`bg: lab(98.26 0 0)`), overlapping the entire sidebar.
  - Verified with `document.elementFromPoint(120, 400)` returning `.dashboard-shell` (the wrap), not the sidebar — confirming the sidebar is in the DOM and laid out correctly but painted underneath the wrap.
  - All sidebar items (Dashboard / Beiträge / Medien / Nutzer / Seiten / Header / Footer / Redirects / Suche / Page Tree / Passkeys / 2FA / API Keys / user-card / dropdown) are unreachable to the eye, although clicks still register because the wrap may not capture in every region.
  - Suggested fix: in the global admin SCSS, override Payload's stock `.template-default` grid to give column 1 a width matching the sidebar (`grid-template-columns: 240px 1fr`), or set `.template-default { display: flex }` and rely on the existing `aside w-[240px] shrink-0`. Alternatively keep the existing template but absolutely-position our `.admin-shell` and add `padding-left: 240px` to `.template-default__wrap`.

- **Critical — Payload's stock AppHeader still renders on top of every page (double chrome).**
  - Where: `header.app-header` at top=0, height=56px, width=1440px, z-index=30.
  - The header still shows Payload's dark "D" home icon (`.step-nav__home`), the hamburger toggle (`.app-header__mobile-nav-toggler`, a relic for Payload's collapsible nav), and the Payload-native Gravatar account link in the top-right. Our sidebar already has its own brand ("Studio"), workspace toggle, and user card — so the user sees two competing brand marks and two account entry points.
  - Suggested fix: hide `.app-header` (or at least `.app-header__step-nav-wrapper` and `.app-header__account`) when our custom sidebar is mounted; we can keep the title bar / step-nav only on edit views, or move only the step-nav text into the wrap and remove the rest. Add `display:none` for `.app-header__bg`, `.step-nav__home`, `.nav-toggler.app-header__mobile-nav-toggler`, `.app-header__account` in our global admin styles.

- **Critical — AppHeader avatar shows the WRONG user (data/visual bug).**
  - Where: `.app-header__account img` is hardcoded to Gravatar SHA `1443599554e11fcf2b2d5f4fb9354253` (which corresponds to `ynavid@icloud.com`, user id=1, alt="yas"), even when logged in as `dashboard-test@local.dev` (id=2, confirmed by `/api/users/me`).
  - The sidebar user card correctly shows "Dashboard Tester / dashboard-test@local.dev". So the bug is local to Payload's stock AppHeader account button — likely a stale cache from server render, a `useAuth()` consumer that read the wrong context, or a hardcoded admin user override.
  - Suggested fix: investigate where the AppHeader sources the avatar. If we hide the entire AppHeader account block (as recommended above), the bug becomes moot. Otherwise wire it to `useAuth().user`.

- **Major — Tailwind preflight has stripped the styling off all stock Payload UI.**
  - Symptom across the entire admin (verified on `/admin/collections/pages`, `/admin/collections/posts`, `/admin/collections/users`, `/admin/collections/media`, `/admin/collections/redirects`, `/admin/collections/search`, `/admin/account`, `/admin/globals/header`, `/admin/globals/footer`):
    - List tables: `table { border-collapse: separate }`, all `td/th` have `padding: 0` and `border: 0` — rows are flush, with no visible row separators or header dividers.
    - Search filter input `.search-filter__input`: `padding: 0`, `border: 0`, `background: rgba(0,0,0,0)` — looks like raw text on the page (only the magnifier glyph SVG remains).
    - List header `.list-header__title`: rendered at `font-size: 13px` — same size as everything else, so "Pages" / "Posts" / "Users" have no visual hierarchy and crash into the "Create New" pill right next to them.
    - "Create New" button `.btn--style-pill`: `padding: 0`, `border: 0` — pill background remains (`lab(93.62)` grey) but the label sits hard against the edges, giving a postage-stamp look. Same problem with "Save" buttons in document controls.
    - Field labels and inputs in `/admin/account` and globals: `padding: 0`, `border: 0`, `background: transparent`, full-viewport-width (`width: 1440`) — no card framing, no visible input chrome at all. Email shows as a plain text line.
    - Checkboxes in `/admin/account` (`Email Verified`, `Two Factor Enabled`): `appearance: auto` (native browser checkbox), 24x24, overlapping the label that's positioned right next to them.
    - Radio group `Admin Theme` (Automatic / Light / Dark): same — native browser radios with no Payload styling left.
    - "Save" / "Enable" / "Add Passkey +" buttons in `/admin/account`: bleeding off the right edge of the viewport because the form has no padding/max-width container.
  - Where: Tailwind's preflight is resetting Payload's base CSS rules (button reset, input border reset, table reset). Payload's component CSS likely uses non-specific selectors (`.btn`, `.field-type`, `table`) and gets overridden by `*, ::before, ::after` declarations in preflight or by Tailwind utilities applied later.
  - Suggested fix: in `app/globals.css` (or wherever the Tailwind `@import "tailwindcss"` lives), gate preflight away from the `.payload-default-template`/`#payload-app` root, or import preflight only inside `:where(.tailwind-root) { ... }` so Payload's stock chrome retains its own resets. Another safe option is to opt-out of preflight (`@layer base { ... }` override) and only ship Tailwind's utilities. As a more targeted patch, restore the killed defaults explicitly: `.btn { padding: 6px 12px; border-radius: 4px; }`, `.search-filter__input { padding: 8px 12px; border: 1px solid var(--theme-elevation-150); background: var(--theme-elevation-0); }`, `.list-controls .table th, .list-controls .table td { padding: 12px; border-bottom: 1px solid var(--theme-elevation-100) }`, etc.

- **Major — Document controls bar overlaps viewport edge, no left gutter for the sidebar.**
  - Where: `.doc-controls` and `.template-default__wrap` start at `left: 0`, width 1440. With the sidebar hidden behind, action buttons like "Save" land at right=1440 (the bare right edge); on global pages and `/admin/account` the "Save" pill is partially clipped (rect `{left:1410.5, w:29.5}` — only 29.5px visible, label flush against the viewport).
  - Suggested fix: same as the sidebar fix — once the grid actually allocates 240px for column 1, content shifts in 240px and Save lands at left ~1390, fully on-screen with its native right gutter.

---

### `/admin` — Custom Dashboard

The dashboard itself (everything inside `.dashboard-shell`) is the most polished surface in the admin; the quick-action cards, "Zuletzt bearbeitet" rows, and the greeting render cleanly because they are 100% custom shadcn and don't depend on Payload's stock CSS.

- **Minor — Recent items list has no visible row separator.**
  - Where: `ul.divide-y.divide-border` under "Zuletzt bearbeitet". The intent is clearly to draw a 1px divider between rows, but the computed `border-top`/`border-bottom` on each `<li>` is `0px`. The `divide-y` utility didn't generate the descendant border rules. Rows look like one continuous strip on hover.
  - Suggested fix: replace the `divide-y` utility with explicit `[&>li]:border-b [&>li]:border-border` on the `<ul>` or apply `border-t border-border first:border-t-0` on each `<li>`. (Tailwind v4 generates `divide-y` differently — confirm the rule reaches the children.)

- **Inconsistency — "Zuletzt bearbeitet" list is unframed while the quick-action grid above it uses bordered cards.**
  - Where: the recent items list sits directly on the page background with no border/shadow/border-radius wrapper, but the four quick-action cards above use `rounded-lg border border-border`. Side-by-side this reads as "the quick actions are cards, the list isn't" — but they're related sections.
  - Suggested fix: wrap the recent list `<ul>` in a `rounded-lg border border-border bg-card overflow-hidden` div for visual parity, and let the divider issue above be solved by the new card frame.

---

### `/admin/collections/pages` — Pages list

All findings here are instances of the cross-cutting preflight/sidebar issues already listed.

- **Major — Table rows are visually fused.**
  - Where: `table.table tbody tr` — no `border-bottom`, no zebra striping, no `padding` on cells, no hover state. Two rows ("New Page", "Test") sit on adjacent text lines with the checkbox column at the very left edge and no padding from the title cell.
  - Suggested fix: targeted overrides for `.collection-list .table td { padding: 12px 16px; border-bottom: 1px solid var(--theme-elevation-100) }`, `.collection-list .table th { padding: 12px 16px; font-weight: 600 }`, and `.collection-list .table tbody tr:hover { background: var(--theme-elevation-50) }`.

- **Major — "Per Page: 10" pagination control has no styling and stacks under "1-2 of 2" with no breathing room.**
  - Where: `.list-controls` / `.paginator` area, bottom-left of the list at `left: 0` flush against viewport edge.
  - Suggested fix: same global preflight reset; also add `padding-top: 16px` to the paginator row.

---

### `/admin/collections/posts` — Posts list

Same as `/admin/collections/pages`. With no posts present we get the "No Results." empty state which looks acceptable visually because the "Create new Post" CTA does keep its background pill — but it's still un-padded.

- **Minor — Empty state "Create new Post" pill is bumping the left viewport edge.**
  - Where: `left: 0`, `padding: 0` (preflight casualty). Black background remains.
  - Suggested fix: gets fixed for free once the sidebar grid issue and the preflight reset are addressed.

---

### `/admin/collections/media` — Media list

Identical pattern to `/admin/collections/pages`. The extra "Bulk Upload" action sits next to "Create New" with the same preflight problems.

---

### `/admin/collections/users` — Users list

Two rows render. Same fused-row look — Dashboard Tester / Navid Y on adjacent text lines, no separators, the user-checkbox column hugging x=0.

---

### `/admin/globals/header` — Header global edit

- **Critical — "Save" / "Edit" / "API" controls clip the right edge.**
  - Where: `.doc-controls` (height 56px, full viewport width) puts the Save button at right=1440 with 0 padding, and the "Edit/API" tabs are also flush right ("Edit API" both clipped).
  - The whole "Nav Items" array field row sits at left=0 with no left padding, and the "Add Nav Item" trigger has lost its dashed-border placeholder appearance.
  - Suggested fix: same — restore preflighted padding/border on `.doc-tabs`, `.doc-controls__controls .btn`, and `.array-field__add-button`; also add left/right gutters once the sidebar column is restored.

---

### `/admin/globals/footer` — Footer global edit

Same as `/admin/globals/header`.

---

### `/admin/collections/redirects` — Redirects list

Same fused-list pattern. With no redirects, the page is mostly empty space.

---

### `/admin/collections/search` — Search list

- **Minor — "Reindex" dropdown trigger sits at the very top-right with no padding/background.**
  - Where: doc-controls area, top-right. After preflight loses the button styling it's just the word "Reindex" followed by a chevron at x=1521 (off-screen) / clipped to viewport.
  - The descriptive paragraph "This is a collection of automatically created search results…" runs edge to edge at left=0; would benefit from the same content gutter as the rest.

---

### `/admin/page-tree` — Page Tree view (plugin-rendered)

- **Inconsistency — Page Tree is the visually nicest page in the admin, but its visual language doesn't match anything else.**
  - Where: this plugin ships its own component library — bordered toolbar buttons ("Expand All", "Collapse All", "New Folder"), search input with `border-radius: 6px`, a sort `<select>` with native chrome, and a GREEN "New Page" primary button (`bg-green-...`).
  - Side-by-side with our shadcn (which uses `bg-foreground text-background`, i.e. solid black primary) and with Payload's stock chrome (which uses dark `lab(0.65)` grey buttons), the green CTA looks like it belongs to a different product. The keyboard-shortcut chips ("Enter Edit", "F2 Rename" along the bottom) are also pleasantly styled — but they're again a visual style nobody else in the admin uses.
  - Suggested fix: live with it for now (it works), or theme-override the plugin if it accepts a theme prop / CSS variables for primary color. At minimum align the "New Page" primary button color to match either our shadcn black or Payload's accent so the entire admin uses one CTA color.

- **Note — Page Tree also has the sidebar-invisible issue.** It just happens to be less noticeable because Page Tree fills the canvas with its own toolbar.

---

### `/admin/account` — Account edit

This page is the most visually broken in the audit.

- **Critical — Native browser checkboxes overlap their labels.**
  - Where: "Email Verified" checkbox (`<input type=checkbox>` 24x24 at left=0) is rendered with `appearance: auto`; the label "Email Verified" sits at left ~18, partially under the checkbox. Same for "Two Factor Enabled".
  - Suggested fix: restore Payload's `.checkbox-input` styling, or replace these stock checkboxes with our shadcn Checkbox.

- **Critical — All form inputs are unstyled and full-bleed.**
  - Where: every `<input>` in the form has `padding: 0`, `border: 0`, `background: transparent`, `width: 1440px`. Email shows as a single line of plain text, indistinguishable from a paragraph. The Name field too. There's no visual signal that these are editable.
  - Suggested fix: restore the preflighted styles on `.field-type input, .field-type textarea`; or wrap admin forms in a Tailwind opt-out container.

- **Major — Action buttons leak off the right viewport edge.**
  - "Save" (right=1440, w=29.5), "Enable" (off-right), "Add Passkey +" (off-right) — every right-aligned button row.
  - Suggested fix: add a right gutter to the document content (the same as the sidebar gutter fix on the left), and restore button padding so the labels aren't text-tight against the viewport edge.

- **Minor — `Admin Theme` radio group looks like native browser radios.**
  - Native circles + text labels with default spacing. Same preflight cause.

---

### Sidebar user-card dropdown (lower-left avatar)

- **Major — Dropdown is rendered but hidden behind the content wrap.**
  - Where: clicking the user-card button (`aside.admin-shell button[aria-haspopup=menu]`) sets `aria-expanded=true` and mounts the popover at `absolute bottom-[58px] left-2 right-2 z-10` (computed rect `{left: 6.5, top: 761, w: 226, h: 81}` with items "Profil / Sicherheit / Abmelden"). It is correctly placed inside the sidebar.
  - But because the parent sidebar is painted under `.template-default__wrap`, the dropdown lands behind that wrap too. `z-index: 10` on a child of a `position: static` parent doesn't outrank a sibling later in DOM order with `z-index: auto` in a separate stacking context.
  - Suggested fix: same root cause as the global sidebar fix. Alternatively raise the entire sidebar's stacking context (`aside.admin-shell { position: relative; z-index: 40 }`), which would also make the dropdown surface above the wrap, but does not solve the larger overlap problem.

- **Minor — Dropdown content text is concatenated without spacing in the accessibility tree.**
  - Where: the user-card button reads "DTDashboard Testerdashboard-test@local.dev" as a single string to screen readers (no space between initials and name). Visually fine, but worth fixing for a11y.

---

## Cross-cutting issues

1. **Preflight casualties.** Tailwind's preflight is wiping Payload's stock button / table / input / checkbox styles. This is the single biggest cause of the "Major" findings across collections, globals, and account pages. One scoping or override fix lifts ~70% of the issues in this report.

2. **Sidebar grid collapse.** `.template-default { display: grid; grid-template-columns: 0px 1440px }` means our 240px sidebar is in a 0px track. Every page is affected. Fixing the grid template (or replacing the layout with flex) unblocks both the sidebar visibility and the doc-controls right-edge clipping.

3. **Double-chrome at the top.** Payload's native AppHeader still ships its own D-logo home icon, hamburger, step-nav, and Gravatar account link — competing with our sidebar's brand block and user card. Hide the relevant `.app-header__*` blocks.

4. **No standardized content gutter.** With the sidebar invisible, all wrap content starts at `left: 0`. Even on the dashboard (which centers within `max-w-[1240px]`) the four quick-action cards extend from x=132 to x=1407 (which is *fine* in isolation but visually too wide for an admin canvas — most CMS admins use a tighter content column).

5. **No skin for plugin-shipped UIs.** Page Tree uses green CTAs and a different button style — outside our control unless the plugin exposes theme knobs.

## Quick wins (in priority order)

1. **Override `.template-default` to actually allocate the sidebar column.** One declaration in the global admin CSS: `body :where(.template-default) { display: flex; min-height: 100vh }`. That alone makes the sidebar visible, fixes the doc-controls clipping, and unbreaks the user-card dropdown.

2. **Hide Payload's stock AppHeader bits.** `.app-header__bg, .nav-toggler.app-header__mobile-nav-toggler, .step-nav__home, .app-header__account { display: none }` (or `.app-header { display: none }` entirely if step-nav isn't needed). Eliminates double-chrome and the wrong-avatar bug in one shot.

3. **Scope Tailwind preflight away from Payload's chrome.** Move `@import "tailwindcss"` to load preflight only inside our `.dashboard-shell` and other custom roots — or, if that's too invasive, re-declare the killed Payload defaults explicitly in `app/(payload)/custom.scss`: `.btn`, `.search-filter__input`, `.field-type input`, `table.table th/td`, `.checkbox-input`, `.field-type label`.

4. **Frame the dashboard's "Zuletzt bearbeitet" list** the same way as the quick-action cards (rounded-lg + border + bg-card), and replace `divide-y` with explicit `border-t` on each `<li>` to guarantee the row separator renders.

5. **Re-skin or hide the Page Tree's green CTA** if visual consistency matters more than the plugin's defaults.

## Open questions for the user

- Are we intentionally keeping Payload's stock AppHeader (for the step-nav breadcrumb on edit pages), or should it be removed entirely?
- Is the `ynavid@icloud.com` Gravatar appearing in the AppHeader for all users a real auth/context bug (avatar leaks across sessions) or just a render artifact specific to my own test session? Worth verifying with two browsers.
- Should the audit re-run after the sidebar/preflight fixes land, to catch the second-order issues currently masked by the broken layout?
