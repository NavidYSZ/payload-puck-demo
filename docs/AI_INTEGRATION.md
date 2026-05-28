# AI-Integration mit eigenen Modellen (Claude / GPT / etc.)

> Wie eigene KIs den Payload + Puck Page Builder programmatisch nutzen können — Pages lesen, schreiben, generieren, ändern. Ohne Puck Cloud Subscription.

---

## TL;DR

- **Pages sind JSON.** Jede Seite ist ein `puckData` JSONB-Blob in Postgres mit definierter Struktur (`content[]`, `root.props`, `zones`).
- **3 API-Wege** stehen zur Verfügung: Payload REST (sofort), Payload GraphQL (sofort), Plugin-spezifische Puck-Routes (selbst wiren, dafür besser).
- **Auth für AI-Agents** läuft sauber über **Better Auth API Keys** (`@better-auth/api-key` ist schon installiert).
- **Eigene KI statt Puck Cloud**: Empfehlung ist **Pfad A** — Payload REST als Tool für Claude/GPT, eigener Orchestrierungs-Layer. Code-Beispiele weiter unten.
- **Realistischer Aufwand für Prototyp**: 2–3 Tage.

---

## 1. Datenmodell verstehen

### Page Schema

Eine Page wird vom `createPuckPlugin` automatisch erzeugt ([src/payload.config.ts:59](../src/payload.config.ts#L59)) und hat folgende relevante Felder:

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | number | Auto-increment PK |
| `title` | string | Pflicht |
| `slug` | string | Auto-generiert aus Folder + `pageSegment` |
| `pageSegment` | string | URL-Segment für diese Page |
| `pageLayout` | `'default' \| 'full-width' \| 'landing'` | Wählt Layout aus [src/lib/puck/layouts.tsx](../src/lib/puck/layouts.tsx) |
| `puckData` | **JSONB (frei)** | **Hier lebt der gesamte Seiteninhalt** |
| `editorVersion` | `'legacy' \| 'puck'` | Migration-Flag |
| `isHomepage` | boolean | Genau eine Page kann das sein |
| `meta.title/description/image` | SEO | Wird vom SEO-Plugin verwaltet |
| `_status` | `'draft' \| 'published'` | Draft/Publish-Workflow |

Generierte TypeScript-Typen: [src/payload-types.ts:364+](../src/payload-types.ts#L364).

### Die `puckData` Struktur

Das ist das einzige Feld, das eine AI wirklich verstehen muss. Format kommt direkt von Puck:

```json
{
  "content": [
    {
      "type": "Section",
      "props": {
        "id": "Section-abc123",
        "padding": "large",
        "background": "transparent"
      }
    },
    {
      "type": "Heading",
      "props": {
        "id": "Heading-def456",
        "text": "Willkommen auf der Demo",
        "level": 1,
        "align": "center"
      }
    },
    {
      "type": "Text",
      "props": {
        "id": "Text-ghi789",
        "text": "Wir verbinden Käufer mit Lieferanten."
      }
    }
  ],
  "root": {
    "props": {
      "title": "Acme Homepage",
      "description": "B2B-Marktplatz"
    }
  },
  "zones": {}
}
```

**Regeln:**
- `content[]` enthält die Komponenten in Reihenfolge (top-to-bottom).
- Jede Komponente hat `type` (muss in der Puck-Config existieren) und `props` (muss zu dem Component-Schema passen).
- `id` muss eindeutig sein, Konvention: `<ComponentType>-<random>`.
- `root.props` sind Seiten-globale Werte (meist Title, Meta etc.).
- `zones` ist für nested Components (Slot/Children). Bei Sections-mit-Kindern kommt das ins Spiel.

### Welche Components gibt es?

Standardmäßig liefert `@delmaredigital/payload-puck` 15+ Komponenten:

- **Layout**: `Section`, `Flex`, `Grid`, `Columns`
- **Text**: `Heading`, `Text`, `RichText`
- **Media**: `Image`, `Video`
- **Interaction**: `Button`
- **Spacing**: `Spacer`, `Divider`

Die volle Config ist importiert über [src/puck/config.ts:3](../src/puck/config.ts#L3) (`fullConfig`). Die SSR-sichere Variante in [src/puck/config.server.ts](../src/puck/config.server.ts).

**Wichtig für AI**: das genaue Component-Schema (welche Props, welche Enum-Werte) musst du der KI mitgeben — siehe Abschnitt "Schema für AI extrahieren" weiter unten.

---

## 2. Drei API-Wege im Vergleich

| | Payload REST | Payload GraphQL | Puck API Routes |
|---|---|---|---|
| **Status** | sofort verfügbar | sofort verfügbar | Routes muss man anlegen (~10 Zeilen) |
| **Pfad** | `/api/pages` | `/api/graphql` | `/api/puck/pages` |
| **CRUD** | ✅ alles | ✅ alles | ✅ alles |
| **Drafts/Versions** | ✅ via `?draft=true` | ✅ | ✅ als separater Endpoint |
| **Auth Hooks** | über Payload Access Control | über Access Control | **feingranular** (`canEdit`, `canPublish` etc.) |
| **Root-Props Mapping** | manuell | manuell | **automatisch** (z.B. `root.props.title` ↔ `meta.title`) |
| **Beste für** | Einfache CRUD-Skripte | Komplexe Queries (mit Filtern) | Production AI-Pipeline |

### 2a. Payload REST (sofort verfügbar)

```bash
# Liste aller Pages
curl http://localhost:3002/api/pages \
  -H "Authorization: Bearer <API_KEY>"

# Einzelne Page lesen
curl http://localhost:3002/api/pages/1 \
  -H "Authorization: Bearer <API_KEY>"

# Neue Page erstellen
curl -X POST http://localhost:3002/api/pages \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Demo",
    "pageSegment": "ai-demo",
    "pageLayout": "default",
    "puckData": {
      "content": [
        { "type": "Heading", "props": { "id": "h1", "text": "Hallo Welt", "level": 1 } }
      ],
      "root": { "props": {} },
      "zones": {}
    }
  }'

# Page updaten (z.B. nur puckData ersetzen)
curl -X PATCH http://localhost:3002/api/pages/1 \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "puckData": { ... } }'

# Page als Draft updaten (nicht direkt publishen)
curl -X PATCH 'http://localhost:3002/api/pages/1?draft=true' \
  -H "Authorization: Bearer <API_KEY>" \
  -d '{ "puckData": { ... }, "_status": "draft" }'

# Page löschen
curl -X DELETE http://localhost:3002/api/pages/1 \
  -H "Authorization: Bearer <API_KEY>"
```

**Query-Parameter** ([Payload REST Docs](https://payloadcms.com/docs/rest-api/overview)):
- `?depth=2` — Wie tief Relationen aufgelöst werden (default 2, für minimal `0`)
- `?where[slug][equals]=home` — Filtern
- `?limit=10&page=1` — Pagination
- `?draft=true` — Drafts mitliefern
- `?select[title]=true&select[slug]=true` — Nur bestimmte Felder

### 2b. Payload GraphQL (sofort verfügbar)

```graphql
# Pages listen
query {
  Pages(where: { _status: { equals: published } }) {
    docs {
      id
      title
      slug
      puckData
    }
  }
}

# Page updaten
mutation {
  updatePage(id: "1", data: { puckData: "{...JSON-String...}" }) {
    id
    title
  }
}
```

Endpoint: `http://localhost:3002/api/graphql`
Playground: `http://localhost:3002/api/graphql-playground`

### 2c. Puck API Routes (selbst wiren, dafür AI-optimiert)

Wenn du das machst, bekommst du:
- Feingranulare Permission Checks pro Operation (`canList`, `canView`, `canCreate`, `canEdit`, `canPublish`, `canDelete`)
- Automatisches Mapping zwischen `root.props` und Payload-Feldern (z.B. SEO)
- Versions-Endpoint mit Diff-Support
- Sauberer Layer wenn du Payload's Access Control nicht direkt exposen willst

**Setup**: Datei anlegen unter `src/app/(payload)/api/puck/pages/route.ts`:

```typescript
import { createPuckApiRoutes } from '@delmaredigital/payload-puck/api'
import { headers } from 'next/headers'
import config from '@payload-config'
import { auth } from '@/lib/auth/config' // Better Auth instance

export const { GET, POST } = createPuckApiRoutes({
  collection: 'pages',
  payloadConfig: config,
  auth: {
    authenticate: async (request) => {
      const session = await auth.api.getSession({ headers: await headers() })
      if (!session?.user) return { authenticated: false }
      return { authenticated: true, user: session.user }
    },
    canCreate: async (user) => ({
      allowed: ['admin', 'editor'].includes(user.role as string),
    }),
  },
  rootPropsMapping: [
    { from: 'title', to: 'meta.title' },
    { from: 'description', to: 'meta.description' },
  ],
  enableDrafts: true,
})
```

Und parallel `src/app/(payload)/api/puck/pages/[id]/route.ts`:

```typescript
import { createPuckApiRoutesWithId } from '@delmaredigital/payload-puck/api'
// ... gleiches Pattern, aber GET/PATCH/DELETE
export const { GET, PATCH, DELETE } = createPuckApiRoutesWithId({ /* ... */ })
```

Details: [node_modules/@delmaredigital/payload-puck/dist/api/types.d.ts](../node_modules/@delmaredigital/payload-puck/dist/api/types.d.ts).

---

## 3. Authentifizierung für AI-Agents

Better Auth ist mit dem `apiKey` Plugin konfiguriert ([src/lib/auth/config.ts:20](../src/lib/auth/config.ts#L20)). Das heißt: API Keys können im System ausgestellt werden, ohne dass die AI Sessions/Passwörter braucht.

### API Key generieren (programmatisch)

```typescript
import { auth } from '@/lib/auth/config'

const apiKey = await auth.api.createApiKey({
  body: {
    name: 'AI Page Generator',
    userId: '<user-id-mit-role-editor-oder-admin>',
    expiresIn: 60 * 60 * 24 * 90, // 90 Tage
    metadata: {
      purpose: 'ai-content-generation',
      maxRequestsPerHour: 1000,
    },
  },
})

console.log('API Key:', apiKey.key) // ⚠ nur einmal sichtbar
```

### API Key generieren (via Admin UI)

Im Payload Admin gibt es Views für API Key Management (kommt vom `createBetterAuthPlugin` automatisch). Siehe [src/plugins/index.ts:69-71](../src/plugins/index.ts#L69-L71) — `apiKey.requiredRole: 'admin'`.

### Mit API Key requesten

```bash
curl http://localhost:3002/api/pages \
  -H "Authorization: Bearer <DEIN_API_KEY>"
```

**Wichtig**: für Payload's REST API musst du eventuell einen User-Header senden, je nach Auth-Setup. Better Auth kümmert sich aber via Middleware um die Session-Mapping. Bei Problemen siehe [Better Auth API Keys Docs](https://www.better-auth.com/docs/plugins/api-key).

---

## 4. Eigene KI integrieren — der wichtige Teil

Die eingebaute `createAiPlugin` / `createAiGenerate` Helper sind an **Puck Cloud** gebunden (siehe [node_modules/.../createAiGenerate.d.ts](../node_modules/@delmaredigital/payload-puck/dist/ai/createAiGenerate.d.ts) — verwendet `@puckeditor/cloud-client`). Für Claude/GPT/eigene Modelle bauen wir das selbst — ist nicht viel Code.

### Pfad A (empfohlen): Direkter Layer auf Payload REST

```
┌─────────────────┐   1. Schema fragen   ┌────────────────┐
│   AI-Agent      │ ───────────────────► │ Schema-Endpoint│
│  (Claude/GPT)   │ ◄─────────────────── │   (selbst)     │
│                 │   Component-Defs     └────────────────┘
│                 │
│                 │   2. Page erstellen  ┌────────────────┐
│                 │ ───────────────────► │ Payload REST   │
│                 │ ◄─────────────────── │  /api/pages    │
└─────────────────┘                      └────────────────┘
```

### Pfad B: Plugin's AI-Scaffolding nutzen, aber eigenen Provider

Möglich, aber tricky — `createAiApiRoutes` ist hart auf den Cloud-Client gemappt. Praktisch heißt das: Plugin-Helpers für Schema-Extraktion und Prompt-Management nutzen, AI-Call aber selbst machen. **Lohnt sich nur, wenn du die Editor-AI-Buttons im Puck UI später aktivieren willst.** Für reine Backend-AI ist Pfad A einfacher.

**→ Diese Doku konzentriert sich auf Pfad A.**

---

## 5. Schema für AI extrahieren

Damit die AI valides `puckData` produziert, muss sie wissen welche Components existieren und welche Props sie haben.

### Eigener Schema-Endpoint

Beispiel-Implementierung: `src/app/(payload)/api/ai-schema/route.ts`

```typescript
import { puckConfig } from '@/puck/config'
import { NextResponse } from 'next/server'

export async function GET() {
  // puckConfig.components ist ein Record<string, ComponentConfig>
  const schema = Object.entries(puckConfig.components).map(([type, config]) => ({
    type,
    fields: Object.entries(config.fields ?? {}).map(([name, field]) => ({
      name,
      type: field.type, // 'text', 'select', 'number', 'array', ...
      options: 'options' in field ? field.options : undefined,
      required: 'required' in field ? field.required : false,
    })),
    defaultProps: config.defaultProps ?? {},
  }))

  return NextResponse.json({
    components: schema,
    layouts: ['default', 'full-width', 'landing'],
  })
}
```

Dann ruft die AI das einmal pro Session ab und hat alle benötigten Infos.

### Alternative: Schema als JSON Schema generieren

Falls du die AI mit **Structured Outputs** (OpenAI) oder **JSON Mode** (Claude) nutzt, kannst du das Component-Schema in ein JSON Schema umformen und als Response-Format mitgeben. Das **garantiert valides Output** auf API-Ebene.

---

## 6. Konkrete Code-Beispiele

### Beispiel 1: Smoke-Test (Page via REST anlegen)

Datei: `scripts/create-test-page.ts`

```typescript
const API = 'http://localhost:3002'
const KEY = process.env.PAYLOAD_API_KEY!

const response = await fetch(`${API}/api/pages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Smoke Test',
    pageSegment: 'smoke-test',
    pageLayout: 'default',
    _status: 'draft',
    puckData: {
      content: [
        {
          type: 'Heading',
          props: { id: 'h-1', text: 'Smoke Test funktioniert!', level: 1 },
        },
        {
          type: 'Text',
          props: { id: 't-1', text: 'Diese Seite wurde via REST angelegt.' },
        },
      ],
      root: { props: { title: 'Smoke Test' } },
      zones: {},
    },
  }),
})

const data = await response.json()
console.log('Created:', data.doc?.id, data.doc?.slug)
```

Ausführen: `npx tsx scripts/create-test-page.ts`

### Beispiel 2: Claude mit Tool Use → Page erstellen

Datei: `scripts/claude-generate-page.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()
const API = 'http://localhost:3002'
const KEY = process.env.PAYLOAD_API_KEY!

// Tool 1: Schema abfragen
const getSchema = async () => {
  const r = await fetch(`${API}/api/ai-schema`, {
    headers: { Authorization: `Bearer ${KEY}` },
  })
  return r.json()
}

// Tool 2: Page anlegen
const createPage = async (input: any) => {
  const r = await fetch(`${API}/api/pages?draft=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...input, _status: 'draft' }),
  })
  return r.json()
}

const result = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  tools: [
    {
      name: 'get_puck_schema',
      description: 'Hol die Liste verfügbarer Puck-Components mit ihren Props.',
      input_schema: { type: 'object', properties: {} },
    },
    {
      name: 'create_page',
      description: 'Erstelle eine neue Page als Draft.',
      input_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          pageSegment: { type: 'string' },
          pageLayout: { type: 'string', enum: ['default', 'full-width', 'landing'] },
          puckData: { type: 'object' },
        },
        required: ['title', 'pageSegment', 'puckData'],
      },
    },
  ],
  messages: [
    {
      role: 'user',
      content:
        'Bau mir eine Landing Page für unser neues Produkt "Acme Insights". ' +
        'Hero, Feature-Liste mit 3 Items, CTA-Button am Ende. ' +
        'Hol dir zuerst das Schema, damit du valides puckData baust.',
    },
  ],
})

// Tool-Use-Loop (vereinfacht — produktionsreif braucht's mehr)
for (const block of result.content) {
  if (block.type === 'tool_use') {
    if (block.name === 'get_puck_schema') console.log(await getSchema())
    if (block.name === 'create_page') console.log(await createPage(block.input))
  }
}
```

> 💡 **Tipp**: Für robustere Tool-Use-Loops siehe [Anthropic Tool Use Docs](https://docs.claude.com/en/docs/build-with-claude/tool-use). Die Schleife läuft, bis Claude `stop_reason: 'end_turn'` zurückgibt.

### Beispiel 3: Bestehende Page mit AI editieren

```typescript
// 1. Page abrufen
const page = await fetch(`${API}/api/pages/42?draft=true`, {
  headers: { Authorization: `Bearer ${KEY}` },
}).then((r) => r.json())

// 2. Claude bitten, einen Block einzufügen
const result = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  messages: [
    {
      role: 'user',
      content:
        `Hier ist die aktuelle Page als puckData:\n\n` +
        JSON.stringify(page.doc.puckData, null, 2) +
        `\n\nFüge nach dem ersten Heading einen Testimonial-Section ` +
        `mit dem Text "Großartiges Tool!" ein. ` +
        `Gib NUR das aktualisierte puckData JSON zurück, kein Markdown.`,
    },
  ],
})

// 3. Antwort parsen + Page updaten
const text = (result.content[0] as any).text
const updatedPuckData = JSON.parse(text)

await fetch(`${API}/api/pages/42?draft=true`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ puckData: updatedPuckData, _status: 'draft' }),
})
```

---

## 7. Custom Puck Components für bessere AI-Ergebnisse

Standardkomponenten sind generisch. Für Acme-spezifischen Content (Produktkarte, Lieferanten-Hero, Kategorie-Grid etc.) lohnt es sich, eigene Components zu definieren. **Vorteil für AI**: enge Props-Schemas zwingen die AI zu validem, brand-konformem Output.

Beispiel: `src/puck/components/SupplierHero.tsx`

```typescript
import type { ComponentConfig } from '@puckeditor/core'

export interface SupplierHeroProps {
  supplierName: string
  tagline: string
  category: 'manufacturer' | 'distributor' | 'service'
  ctaText: string
  ctaHref: string
}

export const SupplierHero: ComponentConfig<SupplierHeroProps> = {
  fields: {
    supplierName: { type: 'text' },
    tagline: { type: 'textarea' },
    category: {
      type: 'select',
      options: [
        { label: 'Hersteller', value: 'manufacturer' },
        { label: 'Händler', value: 'distributor' },
        { label: 'Dienstleister', value: 'service' },
      ],
    },
    ctaText: { type: 'text' },
    ctaHref: { type: 'text' },
  },
  defaultProps: {
    supplierName: 'Lieferantenname',
    tagline: 'Kurzer Pitch',
    category: 'manufacturer',
    ctaText: 'Kontakt aufnehmen',
    ctaHref: '#kontakt',
  },
  render: ({ supplierName, tagline, category, ctaText, ctaHref }) => (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 text-center">
        <span className="text-sm uppercase text-blue-600">{category}</span>
        <h1 className="text-4xl font-bold mt-2">{supplierName}</h1>
        <p className="mt-4 text-xl text-gray-600">{tagline}</p>
        <a href={ctaHref} className="mt-8 inline-block px-8 py-3 bg-blue-600 text-white rounded-lg">
          {ctaText}
        </a>
      </div>
    </section>
  ),
}
```

Dann in [src/puck/config.ts](../src/puck/config.ts) registrieren:

```typescript
import { extendConfig, fullConfig } from '@delmaredigital/payload-puck/config/editor'
import { SupplierHero } from './components/SupplierHero'

export const puckConfig = extendConfig({
  base: fullConfig,
  components: { SupplierHero },
  categories: {
    acme: {
      title: 'Acme Custom',
      components: ['SupplierHero'],
    },
  },
})
```

**Wichtig**: das Gleiche auch in [src/puck/config.server.ts](../src/puck/config.server.ts) eintragen (server-safe version ohne `'use client'`).

Die AI bekommt diese Components dann automatisch übers Schema-Endpoint mit und kann sie in `puckData` verwenden.

---

## 8. Draft / Review / Publish Workflow

**Empfehlung**: AI-Generationen immer als **Draft** speichern, Human Review davor.

### Page als Draft anlegen

```bash
curl -X POST 'http://localhost:3002/api/pages?draft=true' \
  -H "Authorization: Bearer <KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "_status": "draft", ... }'
```

### Drafts im Admin sehen

Drafts erscheinen in der Page-Tree Sidebar mit Status-Badge. Editor kann sie reviewen und manuell publishen (oder via API):

```bash
curl -X PATCH http://localhost:3002/api/pages/42 \
  -H "Authorization: Bearer <KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "_status": "published" }'
```

### Live Preview

Im Admin gibt's bereits Breakpoints (Mobile/Tablet/Desktop) ([src/payload.config.ts:29-49](../src/payload.config.ts#L29-L49)). Reviewer kann AI-Generierung direkt sehen, ohne publishen zu müssen.

### Versionen / Rollback

Das `createPuckApiRoutesVersions` Endpoint listet alle Versions einer Page mit Timestamps und Author. Damit kann ein "Vorherige Version wiederherstellen" Button gebaut werden:

```typescript
// src/app/(payload)/api/puck/pages/[id]/versions/route.ts
import { createPuckApiRoutesVersions } from '@delmaredigital/payload-puck/api'
// ...
export const { GET, POST } = createPuckApiRoutesVersions({ /* ... */ })
```

---

## 9. Production Best Practices

### Performance
- **Cache** `getSchema()` Resultate clientseitig — Schema ändert sich nur bei Deploy
- **Streamen** lange AI-Generierungen mit Server-Sent Events ([Anthropic Streaming](https://docs.claude.com/en/docs/build-with-claude/streaming))
- **Limit setzen** auf max. Tokens und max. Tool Iterations pro Request

### Security
- **Niemals** die UI direkt `puckData` von AI annehmen lassen — immer über Backend mit Schema-Validation
- API Keys mit `expiresIn` ausstellen, nicht ewig gültig
- `metadata.maxRequestsPerHour` setzen und in Middleware rate-limiten
- Audit-Trail: jede AI-Generierung mit User/Timestamp/Prompt loggen
- Wenn Drafts → Published Permission strikt trennen (`canPublish` nur für Admins)

### Reliability
- AI-Responses **immer validieren** bevor speichern:
  ```typescript
  import { z } from 'zod'

  const PuckDataSchema = z.object({
    content: z.array(z.object({
      type: z.string(),
      props: z.object({ id: z.string() }).passthrough(),
    })),
    root: z.object({ props: z.record(z.unknown()) }).optional(),
    zones: z.record(z.unknown()).optional(),
  })

  const validated = PuckDataSchema.parse(aiResponse) // throws bei invalid
  ```
- Bei JSON-Parse-Fehlern: **retry** mit korrigierendem Prompt
- Tool-Use-Loops mit Max-Iteration-Limit absichern

### Cost Tracking
- Tokens pro Request loggen (Anthropic gibt `usage` zurück)
- Per-User oder Per-Page Cost-Aggregation in Payload Collection speichern

---

## 10. Was als Nächstes?

Realistischer Implementierungsplan für ein Acme-MVP (2–3 Tage):

1. **Tag 1**:
   - Schema-Endpoint bauen ([Beispiel oben](#eigener-schema-endpoint))
   - Smoke-Test: Page via REST anlegen ([Beispiel 1](#beispiel-1-smoke-test-page-via-rest-anlegen))
   - API Key Flow testen
2. **Tag 2**:
   - 2-3 Custom Acme-Components definieren ([Abschnitt 7](#7-custom-puck-components-für-bessere-ai-ergebnisse))
   - Claude/GPT Integration mit Tool Use ([Beispiel 2](#beispiel-2-claude-mit-tool-use--page-erstellen))
   - Validation Layer + Error Handling
3. **Tag 3**:
   - Draft-Only Workflow + Review UI
   - Logging / Cost Tracking
   - Production-Härtung (Rate Limits, API Key Expiry)

---

## Referenzen

### In diesem Projekt
- [src/payload.config.ts](../src/payload.config.ts) — Master Config
- [src/plugins/index.ts](../src/plugins/index.ts) — Plugins wired up
- [src/puck/config.ts](../src/puck/config.ts) + [src/puck/config.server.ts](../src/puck/config.server.ts) — Puck Editor Config
- [src/lib/auth/config.ts](../src/lib/auth/config.ts) — Better Auth + API Keys
- [src/payload-types.ts](../src/payload-types.ts) — Generated TypeScript Types

### Plugin-Typen (aus node_modules)
- [Puck API Routes Types](../node_modules/@delmaredigital/payload-puck/dist/api/types.d.ts)
- [AI Types](../node_modules/@delmaredigital/payload-puck/dist/ai/types.d.ts)
- [createAiGenerate](../node_modules/@delmaredigital/payload-puck/dist/ai/createAiGenerate.d.ts)

### Extern
- [Payload REST API Docs](https://payloadcms.com/docs/rest-api/overview)
- [Payload GraphQL Docs](https://payloadcms.com/docs/graphql/overview)
- [Puck Editor Docs](https://puckeditor.com/docs)
- [Anthropic Tool Use](https://docs.claude.com/en/docs/build-with-claude/tool-use)
- [Better Auth API Keys](https://www.better-auth.com/docs/plugins/api-key)
- [delmaredigital/payload-puck GitHub](https://github.com/delmaredigital/payload-puck)
