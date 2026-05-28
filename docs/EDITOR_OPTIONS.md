# Editor-Engine: Puck vs. GrapesJS vs. Eigenbau

> Entscheidungshilfe: welcher Page-Builder passt für Acme + AI-Integration?

---

## TL;DR — Empfehlung

**Bleib bei Puck, mach es richtig.** Konkret: 15–20 Custom Acme-Components + aggressives Theming + die paar UI-Lücken (Inline Editing, bessere Toolbar) selbst füllen. Du landest in 2–3 Wochen bei einem Elementor-ähnlichen Gefühl, ohne das Plugin-Ökosystem aufzugeben.

GrapesJS reißt 4–8 Wochen Arbeit auf und löst keines deiner echten Probleme. Custom-Build ist 3–6 Monate.

---

## Was du eigentlich willst (Elementor-Feeling)

Wenn Leute "Elementor" sagen, meinen sie meist diese Features:

| Feature | Puck heute | GrapesJS | Elementor |
|---|---|---|---|
| Drag & Drop Components | ✅ | ✅ | ✅ |
| Component Library (Sidebar links) | ✅ | ✅ | ✅ |
| Properties Panel (Sidebar rechts) | ✅ | ✅ | ✅ |
| Responsive Preview Buttons | ✅ | ✅ | ✅ |
| Nested Components / Slots | ✅ | ✅ | ✅ |
| Inline Text Editing (auf Canvas) | ⚠️ teilweise | ✅ | ✅ |
| Style Controls direkt im Editor | ⚠️ über Props | ✅ | ✅ |
| Eigene CSS Klassen direkt editierbar | ❌ | ✅ | ✅ |
| Animations Editor | ❌ | ❌ | ✅ |
| Theme Builder (Header/Footer designen) | ❌ (Code-basiert) | ⚠️ teilweise | ✅ |
| Dynamic Content (DB-bound Felder) | ⚠️ über Custom Components | ⚠️ Hack | ✅ |
| AI Content Generation | ✅ (geplant) | ❌ | ❌ |
| Hunderte vorgefertigte Widgets | ❌ | ❌ | ✅ |
| Funktioniert in Payload | ✅ nativ | ⚠️ Integration nötig | ❌ |

**Wahrheit**: Elementor-Parität ist ein Mehr-Monats-Projekt egal mit welcher Engine. Aber 80% des "Feelings" bekommst du mit relativ wenig Arbeit.

---

## Option 1: Puck behalten und ausbauen ⭐ Empfohlen

### Was Puck schon hat
- Drag & Drop Komponenten-System
- Properties Panel mit Field-Types (text, select, number, array, object)
- Multi-Breakpoint Live Preview ([src/payload.config.ts:29-49](../src/payload.config.ts#L29-L49) — Mobile/Tablet/Desktop)
- Nested Components via `zones`
- Versioning + Drafts (via Payload)
- React-nativ, daher kompatibel mit shadcn-Komponenten
- AI-fähig (das ganze Plugin hat AI-Hooks eingebaut)

### Was fehlt für Elementor-Feeling
1. **Inline Text Editing** — aktuell klickt man Component → editiert in Sidebar. Lösung: Custom Field Types die direkt im Canvas inline editierbar sind (Puck unterstützt das via `<DragIcon />` und Custom Render).
2. **Visual Style Controls** — aktuell ändert man `padding="large"` als Select. Lösung: Style-Picker Field-Type bauen (Slider für Padding, Color Picker, etc.).
3. **Polished Look** — Puck-Default-UI ist funktional aber nicht poliert. Lösung: Aggressives CSS-Theming via CSS Variables, eigene Toolbar via Puck Plugin API.
4. **Component Library Visualisierung** — aktuell Text-Liste. Lösung: Custom Render der Component-Liste mit Thumbnails.

### Was wir konkret bauen würden
**Phase 1 (1 Woche): Custom Components**
- `SupplierHero`, `ProductCard`, `CategoryGrid`, `Testimonial`, `CtaBanner`, `FeatureList`, `Pricing`, `FAQ`, `ContactForm`, ~10 mehr — alle Acme-branded
- Jede mit Default-Variant + 2–3 Style-Varianten
- Built-in Image Picker via Payload Media Collection

**Phase 2 (1 Woche): Editor Polish**
- Puck-Toolbar theming mit shadcn-Look (möglich via Puck's `overrides` API)
- Inline Text-Edit für Heading/Text via Custom Field-Type
- Component-Thumbnails statt nur Namen in der Library
- Visual Section-Padding/Margin-Controls

**Phase 3 (3–5 Tage): AI-Integration**
- Schema-Endpoint (haben wir geplant)
- "Generate with AI" Button in der Toolbar (Custom Puck Plugin)
- Inline AI-Suggest pro Component ("Rewrite this text")

**Total: ~2.5 Wochen für einen Editor der sich modern und acme-spezifisch anfühlt.**

### Vorteile
- ✅ Page-Tree-Plugin funktioniert weiter
- ✅ Better-Auth-Integration bleibt
- ✅ Drafts/Versions out-of-the-box
- ✅ AI-Doku gilt 1:1
- ✅ Inkrementeller Fortschritt — du siehst nach jeder Phase Mehrwert

### Nachteile
- ❌ Nie 100% Elementor-Style (Inline Editing bleibt begrenzt)
- ❌ Keine CSS-Class-Editor (musst über Props machen)

---

## Option 2: GrapesJS rein, Puck raus

### Was GrapesJS ist
Open-Source Web Builder Framework (10k+ ⭐), ursprünglich für Newsletter-Builder, jetzt general purpose. Wird u.a. von Mautic, MailChimp-ähnlichen Tools verwendet. Bietet:
- Inline Canvas Editing
- CSS Style Manager (direkt CSS schreibend)
- Asset Manager
- Custom Block Library
- Plugin-System (Webpage, Newsletter, PostCSS, etc.)
- Export als HTML/CSS

### Was wir gewinnen würden
- ✅ Echtes Inline-Editing wie Elementor
- ✅ Visueller CSS-Editor
- ✅ Bessere Style-Manipulation

### Was wir verlieren
- ❌ **Alle drei delmaredigital Plugins** funktionieren nicht mehr (Puck, Page-Tree, Better-Auth-Integration teilweise)
- ❌ Der Renderer im Frontend (`HybridPageRenderer`) muss komplett neu
- ❌ Drafts/Versions: GrapesJS hat eigene Logik, müssen wir mit Payload bridgen
- ❌ Datenformat: GrapesJS speichert HTML+CSS, nicht strukturiertes JSON wie Puck → **AI-Integration komplett umdenken** (statt JSON-Schema zu generieren müsste die AI HTML/CSS produzieren, was viel fehleranfälliger ist)
- ❌ React-Integration ist möglich aber unkomfortabel (GrapesJS ist Vanilla JS, eigene DOM-Manipulation)
- ❌ Die ganze AI-Doku können wir wegwerfen

### Konkrete Aufwandsschätzung
| Aufgabe | Aufwand |
|---|---|
| GrapesJS in Payload Admin einbetten | 4–5 Tage |
| Custom Block-Library für Acme | 1 Woche |
| Payload Pages Collection ↔ GrapesJS State Sync | 3–4 Tage |
| Frontend Renderer (GrapesJS HTML rendern in Next.js) | 4–5 Tage |
| Drafts/Versions Integration | 3–4 Tage |
| AI auf HTML+CSS basieren statt JSON | 1–2 Wochen (komplett neu denken) |
| Theming + Polish | 1 Woche |
| **Total** | **5–8 Wochen** |

### Wann sinnvoll
Wenn du **strikt** Inline-CSS-Editing brauchst und bewusst auf das Plugin-Ökosystem verzichten willst. Für 95% der Use-Cases nicht.

---

## Option 3: Eigenen Editor bauen

### Was das heißt
Du baust einen React-basierten Page Builder von Grund auf:
- Drag & Drop (z.B. `dnd-kit` oder `react-dnd`)
- Eigenes Datenformat
- Eigene Property Panels (mit shadcn — easy)
- Eigene Canvas-Rendering Engine
- Eigenes Style System
- Eigene Persistence

### Wann sinnvoll
- Wenn du Page Builder **als Produkt** baust (eigener Markt)
- Wenn deine Anforderungen so spezifisch sind dass kein Tool sie abdeckt
- Wenn du Vollzeit-Team mit 3+ Devs hast

### Aufwand
**3–6 Monate** für eine V1 die wirklich nutzbar ist. Plus laufende Pflege. Für Acme: **nicht empfohlen**.

---

## Entscheidungsmatrix

|  | Puck ausbauen | GrapesJS | Eigenbau |
|---|---|---|---|
| Aufwand bis MVP | **2–3 Wochen** | 5–8 Wochen | 3–6 Monate |
| Risiko technisch | niedrig | mittel | hoch |
| AI-Integration | **trivial** (haben wir) | von vorne | von vorne |
| Inline Editing | begrenzt | **voll** | nach Wunsch |
| CSS-Class-Editor | nein | **ja** | nach Wunsch |
| Plugin-Ökosystem behalten | **ja** | nein | nein |
| Wartungslast | Plugin-Updates folgen | mittel | hoch |
| Lernkurve fürs Team | niedrig | mittel | hoch |
| Look-and-Feel "professionell" | ✅ machbar mit Theming | ✅ | ✅ |
| Score | **9/10** | 5/10 | 3/10 |

---

## Migrations-Pfade (für später)

Falls du in 6 Monaten doch sagst "ich will GrapesJS": die Migration wäre nicht trivial aber machbar, weil:
- Pages sind als JSON in Postgres — exportierbar
- Eine JSON → HTML Konvertierung pro Component schreiben (1–2 Tage)
- GrapesJS Import via `editor.setComponents(html)` möglich

Heißt: **Puck jetzt ist keine Sackgasse**. Wenn du später was anderes willst, geht das.

---

## Konkrete Empfehlung als nächste Schritte

1. **Diese Woche**: Phase 1 starten — 3–5 Acme Custom Components bauen, sehen wie sich das anfühlt
2. **Nächste Woche**: Editor-Polish + Theming
3. **Übernächste Woche**: AI-Integration aktivieren (parallel zur Admin-Visuals-Arbeit)

Wenn du nach Phase 1 das Gefühl hast "das wird nichts", können wir umentscheiden — dann hast du nur eine Woche investiert, nicht 8.
