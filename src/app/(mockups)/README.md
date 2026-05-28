# Admin Sidebar Mockups

Three live mockup pages exploring distinct sidebar philosophies for the Studio
admin. Pure frontend routes — no Payload connection, no shared state with the
real admin. All three reuse the same shadcn tokens, Geist font, and oklch
greyscale palette as the rest of the project.

Routes:

- `/admin-mockups` — index with three preview cards
- `/admin-mockups/v1` — Variant A
- `/admin-mockups/v2` — Variant B
- `/admin-mockups/v3` — Variant C

The dashboard area on the right is identical across all three so the only
visual variable is the sidebar.

## Variant A — Linear-modern (240px)

A modern, conservative baseline: grouped icon-plus-label rows, soft section
headers, ⌘K search at the top, primary "Neu erstellen" action, and a
collapsible user card pinned at the bottom. Active rows use a soft accent fill
and a slight font-weight bump; hover is intentionally barely visible. Closest
to what Linear, Vercel, and Supabase ship today. Trade-off: it's the safest
choice — high readability and zero surprise — at the cost of being the least
distinctive of the three.

## Variant B — Notion-workspace (260px)

Treats the workspace as a hierarchical tree. The Pages collection expands
inline to reveal the actual page tree (with one level of nesting),
Posts expands to recent items with draft indicators, and Globals/Settings are
inline collapsibles too. Drag-handles and a `+` quick-add appear on hover. A
Favoriten section sits above the main nav. Trade-off: huge information density
and a strong "tool" feel — but more visual noise, and only really shines if
content authors actually live inside the page tree. Best when nav doubles as
content navigation.

## Variant C — Icon-rail (60 → 240px)

A 60px icon-only rail that expands to 240px on hover or via a pin toggle at
the bottom. Collapsed state shows just icons with subtle status dots for items
that have drafts. Tooltips reveal labels on hover. Inspired by Cursor, Arc,
and Raycast. Trade-off: the main content area gets the most breathing room of
any variant, but the collapsed state asks the user to learn the icons — which
is fine for daily power users but rough for occasional editors.

## Recommendation

**Variant A** for most users, **Variant C** if the audience is power users
who live in this admin daily. Variant B is overkill unless we commit to the
sidebar doubling as a page-tree editor (currently `/admin/page-tree` is its own
view, so the tree-in-sidebar story is unclear). If forced to pick one to ship,
I'd recommend **Variant A with one Variant-C borrow**: the 240px Linear-style
sidebar plus a pin/collapse toggle so power users can shrink it to a rail. It
keeps the discoverability of A and earns back the screen real estate of C.
