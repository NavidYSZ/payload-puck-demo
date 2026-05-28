# Deep UI/UX Audit (Phase 2 follow-up) — 2026-05-28

Viewport: 1440x900
Auth: dashboard-test@local.dev (role=admin)
Status: COMPLETE

## Severity legend
- 🔴 Critical — blocks usability or looks clearly broken
- 🟠 Major — noticeable defect that hurts polish
- 🟡 Minor — small alignment / spacing issue
- 🔵 Inconsistency — works but doesn't match the design language
- 🟣 Shadcn-upgrade — native element ready for a shadcn replacement

## Top-line summary

**52 findings across 11 pages.** Counts: 🔴 3 / 🟠 27 / 🟡 11 / 🔵 9 / 🟣 2.

The high-level pattern: the OUTER chrome (sidebar, list view, dashboard) is polished, but the INNER form & widget layer (everything inside the document edit/create surface) is still raw Payload defaults — transparent backgrounds, 0px borders, custom-built inputs/checkboxes/radios that don't render visible borders, and a Lexical editor with no container. The shell looks shadcn; the body looks 2018-Payload.

Highest-impact issues (do these first):
1. Repeater rows (.collapsible.array-field__row) have zero chrome — global fix benefits Header, Footer, every blocks/array field.
2. Custom Payload checkboxes & radios are unstyled — visible across users, account, every form.
3. react-select (.rs__control) is borderless in both themes — every relationship + select field.
4. Lexical editor + toolbar has no container — visible on Posts and Media.
5. Dropzone for media has no border/area — looks like text, not a drop target.

## Findings by page

### /admin/collections/posts/2 — Posts edit form

- 🟠 **Inner tab bar (Content / Meta / SEO) has no active-state indicator** — active and inactive buttons share identical color, weight 400, and background; only an invisible class distinguishes them.
  - Where: `.tabs-field__tab-button--active` (top of form, y≈297)
  - Fix: add `border-bottom: 2px solid hsl(var(--primary))` + `font-weight: 600` for `--active`, or → shadcn `Tabs`
- 🟠 **Lexical rich-text toolbar floats with no container** — `.fixed-toolbar` has transparent bg, 0px border, no shadow, no separator from the editor surface, so the icon buttons hang in space.
  - Where: `.fixed-toolbar` (y≈391)
  - Fix: wrap toolbar in a card-style strip — `background: hsl(var(--muted)/.4); border: 1px solid hsl(var(--border)); border-radius: 8px 8px 0 0`; or → shadcn `Toolbar`-style header (Menubar)
- 🟠 **Lexical editor surface has no border** — `.field-type.rich-text-lexical` is bg-transparent with no border or min-height; visually it's not distinguishable from the page.
  - Where: `.field-type.rich-text-lexical`
  - Fix: `border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 12px; min-height: 200px;`
- 🟡 **Upload pills "Create New" / "Choose from existing" render as plain underlined text** — `btn--style-pill` resolves to transparent bg, no border, no rounding; reads as a hyperlink rather than a button.
  - Where: `.upload__createNewToggler`, `.upload__listToggler` (Hero Image dropzone)
  - Fix: → shadcn `Button` variant=`outline` size=`sm`
- 🔵 **Doc tabs (Edit / Versions / API) sit visually outside the page chrome** — they're top-right above any container, with a subtle bg only on active; loose-looking. Versions counter "1" is just inline plain text.
  - Where: `.doc-tabs` (top-right, y=0–36)
  - Fix: wrap in a `border-bottom` strip with the doc title, or → shadcn `Tabs` + `Badge` for the count

+ 4 minor: status pill `Status: Draft` is plain text not a pill; "No Folder" reads as info but isn't badge-styled; published-at field has `border:0px` and looks like an unstyled input; `.popup-button` (chevron next to Publish) has no visible divider from the primary button.

### /admin/globals/header — Header global (Nav Items repeater)

- 🔴 **Repeater row has zero container styling** — `.collapsible.array-field__row` is transparent, no border, no padding, no shadow, no margin between rows. Result: when you expand a row its contents flow flush with the surrounding form with no visual grouping.
  - Where: `.collapsible.array-field__row`
  - Fix: `background: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 16px; margin-bottom: 12px;` or → shadcn `Card`
- 🟠 **Row toggle button has no chrome** — `.collapsible__toggle--open` is fully transparent, weight 400, plain text. The collapsed/expanded indicator chevron is missing visible affordance, and the "Toggle block" label overlaps the row title in screenshot.
  - Where: `.collapsible__toggle`
  - Fix: style as a row-header strip with bg, font-weight 600, dedicated chevron icon button; or → shadcn `Accordion` trigger
- 🟠 **Radio buttons render as flat colored dots with no visible group container** — `radio-input--is-selected` indicated only via small dot; no pill / segmented-control treatment, no surrounding border for the group.
  - Where: `.radio-group--layout-horizontal`
  - Fix: → shadcn `RadioGroup` or `ToggleGroup` for segmented radio
- 🟠 **Checkbox is a custom 20×20 div with `border: 0px`** — `.checkbox-input__input` has bg white but no border, so unchecked state is invisible against light backgrounds.
  - Where: `.checkbox-input__input`
  - Fix: add `border: 1px solid hsl(var(--input))` + checked filled state; or → shadcn `Checkbox`
- 🟡 **Array header actions (Collapse All / Show All) are plain text without dividers** — they read as labels, not interactive controls.
  - Where: `.array-field__header-action`
  - Fix: style as `Button` variant `ghost` or text-button with `:hover` underline; or → shadcn `Button` size=`sm`

+ 3 minor: `Add Nav Item` is a btn--style-icon-label with bg transparent — looks like a hyperlink; no drag-handle visible despite `collapsible--has-drag-handle` class; "Document to link to*" required asterisk inherits same color as label.

### /admin/collections/users/2 — Nutzer edit

- 🟠 **Email Verified custom checkbox is invisible when unchecked** — same `.checkbox-input__input` issue: white-on-white square with `border:0px`. User can't tell field state at a glance.
  - Where: `.checkbox-input__input` (Email Verified row)
  - Fix: → shadcn `Checkbox`
- 🟠 **Role field uses react-select with no shadcn match** — `.rs__control` is white bg, 38px tall, only `min-height` styled, no border-radius, no border. Looks like a 2010-era picker.
  - Where: `.field-type.select .rs__control`
  - Fix: add `border: 1px solid hsl(var(--input)); border-radius: 6px` via `.rs__control { … }` override, or → swap to shadcn `Select`
- 🟡 **"2FA Enabled" section is unstyled text + lone Enable button** — text + button live in field-area whitespace with no card frame, so the feature reads as a stray sentence.
  - Where: `.field-type[id*='twoFactor']`, near `Enable` button
  - Fix: wrap section in shadcn `Card` with title, description, action
- 🔵 **"No passkeys registered." sits as bare text below the Add Passkey button** — no empty-state illustration, no card.
  - Where: `.passkeys-management`
  - Fix: small `Card` empty-state + `Button` for Add
- 🟣 **Form actions row (Save + ⋮ kebab) lacks any save-progress affordance** — once clicked, no spinner state visible on the button itself.
  - Where: `#action-save`
  - Fix: → shadcn `Button` with loading prop / spinner inside

+ 2 minor: `Created` and `Last Modified` labels read inline above the form with no card-header treatment; no avatar preview for the Image field even though the user has a name initials.

### /admin/account — Account view & sidebar user dropdown

- 🟠 **Sidebar user-card button does not open a dropdown menu** — clicking the bottom-left user-card produces no popover (no `[role='menu']` or `data-radix-popper`); user must know to navigate manually to `/admin/account`. Discoverability fail.
  - Where: `aside button.group.flex.w-full.items-center.gap-2\.5`
  - Fix: → shadcn `DropdownMenu` triggered by the user card with Profile / Settings / Logout
- 🟠 **Admin Theme radio buttons render as identical white circles** — both selected and unselected `.radio-input__styled-radio` have `background: white`; only difference is a faint box-shadow on the selected one. There's no inner dot, no color fill.
  - Where: `.radio-input__styled-radio`
  - Fix: → shadcn `RadioGroup` with proper indicator; theme picker should be a segmented control / `ToggleGroup` instead
- 🟠 **Language picker uses react-select with no border** — `.rs__input` height 20px, no border, no rounding; together with `.rs__control` min-height 38px this is a chunky-but-borderless dropdown.
  - Where: `.field-type:has([id='field-language']) .rs__control`
  - Fix: → shadcn `Select` (uses Radix Select primitives)
- 🟡 **No section grouping** — Email / Profile / 2FA / Passkeys / Payload Settings (Language, Theme) all stack as one long form with no visual separation between security and preferences.
  - Where: account form root
  - Fix: split into `Card`-grouped sections (Account, Security, Preferences)
- 🔵 **No "current logged-in user" indicator on this page** — title is just "Dashboard Tester" (the name), no avatar header, no breadcrumb saying "Your Account"; only the page-header text tells you.
  - Where: account header
  - Fix: add an Avatar + Name header card like a typical profile page

+ 2 minor: "Two Factor Enabled" displays as read-only checkbox + label even though there's an Enable button below; redundant; the Admin Theme `Automatic` option has no preview / no tooltip.

### /admin/collections/media/create — Medien upload

- 🔴 **No real "drag-and-drop" zone** — `.dropzone` is transparent, `min-height: auto`, height 31.5px, no dashed border. It looks like inline text "Select a file or Paste URL or drag and drop a file" rather than a target area.
  - Where: `.dropzone.dropzoneStyle--default`
  - Fix: dashed border, larger height, icon — `border: 2px dashed hsl(var(--border)); padding: 48px; border-radius: 12px; text-align: center;` or → wrap in shadcn `Card` with a dropzone state
- 🟠 **"Select a file" and "Paste URL" buttons are pill-text (no chrome)** — `btn--style-pill` => transparent bg, no border, no rounding visible despite the class name.
  - Where: `.file-field__dropzoneButtons .btn--style-pill`
  - Fix: → shadcn `Button` variant `outline` or `secondary`
- 🟠 **Caption Lexical editor in this view inherits the same toolbar issues** — same transparent fixed-toolbar from posts, just a smaller editor.
  - Where: `.field-type.rich-text-lexical` (Caption)
  - Fix: same as Posts (toolbar container styling)
- 🟡 **Alt-text input has no border** — `.field-type.text input` height 40px but no border (Payload-default white) - identical to other inputs but it's the only field visible at create-time so it stands out.
  - Where: `input[name='alt']`
  - Fix: global input styling `border: 1px solid hsl(var(--input))`
- 🔵 **"No Folder" badge and "Creating new Media" header collapse on one line** — header doesn't feel like a "new document" landing page.
  - Where: `.doc-controls`
  - Fix: card-styled header with "Create Media" title and breadcrumb

+ 2 minor: hidden file input is present but no progress UI; no preview placeholder area.

### /admin/globals/footer — Footer global

- 🔵 **Identical schema to Header global** — same Nav Items repeater; inherits all five Header findings (no card on rows, plain toggle, radio dots, invisible checkbox, plain header actions). Fixing the array-field globally will cover Footer.
  - Where: `.array-field, .collapsible.array-field__row` (shared)
  - Fix: address Header findings — they propagate to all repeaters.
- 🟣 **No visual differentiation from Header in the UI** — the only cue is the breadcrumb-style title `Footer`. Globals should probably show their schema icon and a different background or section banner.
  - Where: `.doc-controls`, header title
  - Fix: → add badge / icon (`Header` vs `Footer` clarity), shadcn `Badge`

+ 1 minor: empty-state ("No items yet") is plain text-only — could use shadcn `Card` empty state w/ icon + CTA.

### /admin/collections/redirects/create — Redirects create

- 🟠 **Group field `To URL Type` is invisibly grouped** — `.group-field--top-level` has no border, no padding, only `margin-bottom: 16px`. The group label sits inline with no chrome, so the two related fields read as siblings of the unrelated `From URL`.
  - Where: `.group-field--top-level`
  - Fix: → shadcn `Card` for top-level groups, or fieldset border + legend
- 🟠 **`Add new` relationship button is a 20×26 transparent icon-only button** — no border, no bg, no tooltip displayed (only `aria-label`); reads as decoration.
  - Where: `.relationship-add-new__add-button`
  - Fix: → shadcn `Button` size=`sm` variant=`outline` with `+` icon and visible tooltip
- 🟡 **Field description text is mid-gray and small** — readable but no icon, easy to miss.
  - Where: `.field-description`
  - Fix: prepend a small `i` icon (lucide `Info`); → shadcn `Tooltip` could host longer help
- 🟡 **Required asterisk colored same as label** — `*` after `From URL`, `Document to redirect to*` is the same color as the label, no destructive accent.
  - Where: `.field-label`
  - Fix: `[required] .field-label::after, .field-label[for*='required']` styling to `color: hsl(var(--destructive))`
- 🔵 **Page header "Creating new Redirect" sits as plain bold text, no separation from form** — minor identity issue across all create views.
  - Where: `.doc-header__title` (or equivalent)
  - Fix: add page-header card / breadcrumb

+ 1 minor: no save-and-add-another, no copy-as-curl utility for redirects.

### /admin/collections/search — Suche list + Reindex

- 🟠 **List controls "Columns"/"Filters" pills look like badges, not buttons** — `.pill--style-light` has bg `lab(93.62)` (light grey) with no border, no chevron emphasis; they read as labels.
  - Where: `.list-controls__toggle-columns`, `.list-controls__toggle-where`
  - Fix: → shadcn `Button` variant=`outline` size=`sm` + chevron icon for toggleable filters
- 🟠 **Reindex dropdown opens as a generic popover (no card chrome)** — `.popup__content` is white bg, `box-shadow: 0 -2px 16px -2px`, `border-radius: 4px`, but the inner list items (`.popup-button-list__button`) have no hover bg, no separators, look like plain text.
  - Where: `.popup__content`, `.popup-button-list__button`
  - Fix: → shadcn `DropdownMenu` (Radix) — handles focus, hover, keyboard, separators
- 🟡 **Empty state "No Results" is two lines of plain text** — no icon, no CTA, no styled box.
  - Where: `.collection-list__empty, .table-empty` (or equivalent)
  - Fix: → shadcn `Card` w/ icon + clear CTA ("Trigger Reindex")
- 🔵 **Column-toggle pills in the page header (Title, ID, Priority, Doc…) are inline grey badges with no checkboxes/states** — confusing because every column is shown but they look like already-selected chips.
  - Where: `.pill-selector__pill`
  - Fix: → shadcn `DropdownMenuCheckboxItem` list in a `DropdownMenu`
- 🔵 **Search input is borderless on light grey bg** — `lab(98.26)` bg, 1px border `lab(90.72)` — extremely low contrast; reads almost flush with the page.
  - Where: `.search-filter__input`
  - Fix: deeper border `hsl(var(--input))` and stronger focus-ring

### Sidebar interactions

- 🟠 **No active-nav state** — current page link has no `aria-current` and no distinguishing background; e.g. on `/admin/collections/search` "Suche" nav item should have a filled bg but renders identical to siblings (verified: `aside nav a[aria-current]` returned null).
  - Where: `aside nav a` (all)
  - Fix: server-render `aria-current="page"` from Next.js pathname + style `[aria-current] { background: hsl(var(--accent)); color: hsl(var(--accent-foreground)); }`
- 🟠 **Workspace switcher icon-only button is undiscoverable** — `aside button.inline-flex.h-7.w-7` has no visible label or tooltip, transparent bg, text-muted icon. Clicking opens a small list but discovering the affordance requires guessing.
  - Where: `aside button[aria-label='Workspace switcher']`
  - Fix: → shadcn `DropdownMenu` w/ visible trigger label or → `Tooltip` showing "Switch workspace"
- 🟡 **"Neu erstellen" CTA is solid black at all states** — `bg: foreground` with white text. Looks good but no hover or pressed state visible (no transition or hover variant defined).
  - Where: sidebar "Neu erstellen" link
  - Fix: add `hover:bg-foreground/90 transition` (likely already present but visually identical due to color)
- 🟡 **`⌘K` search button visually OK but `⌘` and `K` glyphs aren't styled as `<kbd>` chips** — they sit as plain text inside the button.
  - Where: aside button "Suchen…⌘ K"
  - Fix: wrap in shadcn-styled `<kbd>` with bg `muted`, rounded, mono font
- 🔵 **Sidebar section labels (ÜBERSICHT / CONTENT / GLOBALS / EINSTELLUNGEN) are uppercase but with no spacing/letter-spacing tweaks visible** — they read as small grey lines.
  - Where: `aside p` section headers
  - Fix: `letter-spacing: 0.06em; font-size: 11px; color: hsl(var(--muted-foreground));` (probably already done — minor polish)

+ 1 minor: there is no visible hover affordance preview on nav items (no underline, no chevron) — only a bg color change on hover (not visually verified via `:hover` here).

### Dark mode — Dashboard / Posts list / Posts edit

- 🟠 **Latest Activity / dashboard cards have no card chrome in dark mode** — sampled card has `background: transparent; border: 0px; border-radius: 0px;`. Light mode at least had subtle white-on-grey cards; here they're indistinguishable from the page background.
  - Where: dashboard top-row cards (`section`/`article` children)
  - Fix: define `--card` and `--border` so both modes render bordered cards
- 🟠 **react-select `.rs__control` switches to nearly-black bg `lab(2.48)` but is otherwise borderless** — Role/Authors picker in dark mode is almost invisible against `lab(1.20)` page bg.
  - Where: `.rs__control` (all dark-mode pages)
  - Fix: `.rs__control { background: hsl(var(--card)); border: 1px solid hsl(var(--input)); }`
- 🟠 **`.search-filter__input` and `input#field-title` collapse to `bg: lab(2.48)` with no border** — invisible against the page; only the placeholder text gives a clue an input exists.
  - Where: list search input + form inputs
  - Fix: same as above — add border + ensure `--input` provides contrast in dark
- 🟡 **`.doc-controls` strip is `lab(1.20)` — almost identical to body bg** — the "No Folder / Status: Draft / Last Modified / Publish changes" toolbar lacks separation.
  - Where: `.doc-controls`
  - Fix: `border-bottom: 1px solid hsl(var(--border))` + slightly elevated bg
- 🔵 **Sidebar in dark mode has `border-right: 1px solid lab(9.52)` (visible)** — but the rest of the page has zero borders. Inconsistency.
  - Where: aside element vs main content
  - Fix: use consistent `--border` everywhere; make sure cards/forms also draw their dividers

+ 2 minor: header tabs (Edit / Versions / API) become invisible against dark bg because the active bg is `lab(95.94)` (light grey) inverted to white — too high contrast and looks like a glaring chip; pill `--style-light` (Columns/Filters) becomes pale grey on near-black, fairly OK but stands out vs the otherwise dark UI.

### /admin/page-tree — Page Tree (plugin)

- 🔵 **Plugin owns visuals; styling is bootstrap-ish** — Sort `Default`/Expand All/Collapse All are native `<select>` and unstyled buttons; tree nodes render with a `Standard` green pill that doesn't match the design system. Plugin needs custom-stylesheet hooks to fit.
  - Where: `/admin/page-tree`
  - Fix: out of scope here — open follow-up issue with plugin theming overrides. → shadcn `Select`, `Button`, `Badge` if exposing slots.

+ 1 minor: footer toolbar (Copy / Edit / Duplicate / Delete / Drag / Folder / Page / Unpublish / Designer) is a long bar of low-contrast text chips; would benefit from grouping.

<!-- INSERT_NEXT_HERE -->

## Cross-cutting issues

1. **Form inputs have `border: 0`** — `<input>`, `.rs__control`, `.checkbox-input__input`, `.fixed-toolbar`, `.dropzone`, repeater row, group field — every single one. The site needs a global `--input`/`--border` token and a `*.field-type input, .rs__control, .checkbox-input__input { border: 1px solid hsl(var(--input)); border-radius: 6px; }` reset.

2. **Payload's custom widgets (checkbox/radio div-as-input) are unbranded** — they're not native, not shadcn; they're vanilla DOM with no visual indicator. Either reskin them with stronger borders + check/dot indicators, or replace with shadcn Radix primitives.

3. **No card / fieldset container for "groups of fields"** — group-field, array-field, sidebar tabs, doc-controls, 2FA section all sit as bare label+content. The design system has cards on the dashboard but not inside the form views.

4. **Active state indicators are missing** — inner tabs (Content/Meta/SEO), doc tabs (Edit/Versions/API), sidebar nav item, theme radio — selected items render identical or near-identical to unselected.

5. **Popup / dropdown styling is inconsistent** — Payload's `.popup__content` exists but the content (`.popup-button-list__button`) lacks hover bg, separators, keyboard ring; lots of features that should be Radix DropdownMenu are using Payload's homegrown popover.

## Shadcn upgrade plan

Ordered by impact × surface area:

1. **`Checkbox` + `RadioGroup`** — every form has them; current divs are invisible-when-unchecked. Big visual win.
2. **`Select` (Radix-based)** — replace `react-select` (`.rs__control`) globally. Role, Language, every relationship/select dropdown.
3. **`Card` container for field groups** — wrap `.array-field__row`, `.group-field--top-level`, the Lexical editor, and the 2FA/Passkey sections. Single CSS change in `custom.scss` could deliver this without touching schemas.
4. **`Tabs`** — replace `.tabs-field` (inner Content/Meta/SEO) and `.doc-tabs` (Edit/Versions/API). Active state lives natively in Radix Tabs.
5. **`DropdownMenu`** — replace Payload's `.popup__content` + `.popup-button-list` for Reindex, row actions (Add Below/Duplicate/Remove), workspace switcher, and the missing user-card dropdown.
6. **`Button` for "pill" buttons** — `btn--style-pill`, `.upload__createNewToggler`, `.file-field__dropzoneButtons` pills, list-controls pills.
7. **`Toolbar` / `Menubar`** — re-skin the Lexical `.fixed-toolbar`.
8. **`Tooltip`** — every icon-only button (Workspace switcher, relationship Add new, popup chevrons).
9. **`Badge`** — `Status: Draft`, `No Folder`, Versions counter, role labels.
10. **`Sonner` (toasts)** — confirm a save flow exists and adopt the consistent toast style across save/error/network feedback.
