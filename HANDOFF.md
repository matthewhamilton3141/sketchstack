# Sketchstack — Handoff

_Last updated: 2026-07-16_

A working handoff so we can clear context and resume cleanly. Read this first.

## What Sketchstack is
Visual system-design canvas (React Flow) where you drag typed nodes, wire them
with labeled edges, add sticky notes, and click **Generate Prompt** to turn the
diagram into a Markdown spec for AI coding agents. Guest-first: everything works
with no login; only **cloud save** needs a GitHub account (Supabase).

- Next.js 16.2.10 (App Router, Turbopack), TypeScript, Tailwind v4
- `@xyflow/react` v12.11 canvas; `lucide-react` icons; `html-to-image` export
- Supabase (GitHub OAuth + Postgres + RLS) for accounts, cloud save, sharing
- Deploys to Vercel on push (sketchstack.vercel.app)

## How to run
```bash
npm run dev   # serves on :3000, or next free port (:3001) if taken
```
Guest features need no env. Auth/cloud need `.env.local` with
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already set locally).

⚠️ Gotcha we already hit: if you `kill` the dev process, the page "won't load"
because nothing is listening — just re-run `npm run dev`.

---

## RESOLVED on 2026-07-16 (this session)

### Bug 2 — Shared view (/d/[id]) missing arrows/text — FIXED ✅
**Root cause (confirmed via `@xyflow/system` source, not guessed):** every handle
in `SystemNode.tsx` is `type="source"`. `getEdgePosition` only searches *target*
handles for the edge's target end **unless `connectionMode` is Loose**. The editor
(`Canvas.tsx`) sets `ConnectionMode.Loose`; the shared viewer used the default
(Strict), so every edge's target-handle lookup failed → `getEdgePosition` returned
`null` → edges rendered no path, arrowhead, or label. Nodes/notes were fine.
The stale-snapshot AND theme/var theories were both wrong — the DB row had all 6
edges with labels + handles intact.
**Fix:** added `connectionMode={ConnectionMode.Loose}` to the shared `<ReactFlow>`.

### Bug 1 — Image export (PNG/SVG) — REMOVED (not fixed) ✅
User decided to drop it and let people screenshot instead; sharing is now the
primary "show others" path. Deleted `src/lib/exportImage.ts`, the PNG/SVG toolbar
buttons + `handleExport`, and the `html-to-image` dependency. `slugify` moved to
`src/lib/slugify.ts`. (Note for the record: the old "inject vars" fix could never
have worked for arrows — arrowheads use a concrete `#b1b1b7`, not a `var()`.)

### Sharing improvements ✅
- **Prominent Share button** in the main toolbar (`Canvas.tsx` `handleShare`):
  one click saves+publishes+copies the `/d` link, prompts sign-in (AuthModal) if
  logged out, with Sharing…/Link copied! feedback.
- **Better viewer** (`SharedDiagram.tsx` + `src/app/d/[id]/page.tsx`): read-only
  badge, "Copy link" button, and server-side `generateMetadata` (OG/Twitter tags
  from the public diagram's name) so pasted links preview nicely. Verified live.

### Educational "Learn" features (was task #19) — DONE ✅
- `description` added to every kind in `src/lib/nodeTypes.ts` (`NodeKindSpec`).
- Palette hover tooltip: `src/components/NodePaletteItem.tsx` (portal + fixed
  positioning so the palette's `overflow-y-auto` doesn't clip it).
- Description surfaced in `DetailsPanel.tsx`.
- `src/components/LearnPanel.tsx` — modal opened from a toolbar **Learn** button:
  how-it-works steps, starter blueprints (reuses `TEMPLATES`, "Use this" switches
  to system mode + drops it in), and a component glossary for the current mode.

All changes: `npx tsc --noEmit` clean, ESLint clean on touched files, home + `/d`
routes serve 200. **User still needs to eyeball in the browser** (shared arrows,
Share flow, palette tooltips, Learn panel).

---

## Key files map
- `src/components/Canvas.tsx` — main editor (~800+ lines): nodes/edges state,
  undo/redo, palette, DnD, toolbar, all panels, cloud handlers.
- `src/components/SystemNode.tsx` / `NoteNode.tsx` — the two node types.
- `src/components/DetailsPanel.tsx` / `EdgePanel.tsx` / `NoteEditorPanel.tsx` /
  `PromptPanel.tsx` / `CloudPanel.tsx` / `LearnPanel.tsx` — side/modal panels.
- `src/components/SharedDiagram.tsx` — read-only `/d/[id]` viewer (needs
  `ConnectionMode.Loose` — see Bug 2 above).
- `src/components/NodePaletteItem.tsx` — palette chip + portal hover tooltip.
- `src/lib/slugify.ts` — filename slug (was in the deleted exportImage.ts).
- `src/lib/nodeTypes.ts` — node registry (kinds, colors, icons, modes, palette,
  `description`).
- `src/lib/modes.ts` — per-mode prompt config. `src/lib/generatePrompt.ts` —
  graph → Markdown. `src/lib/appNode.ts` — `AppNode = SystemNode | NoteNode`.
- `src/lib/cloudDiagrams.ts` — Supabase CRUD + sharing. `storageKeys.ts` —
  localStorage keys. `supabase.ts` — client (+ `isSupabaseConfigured`).
- `supabase/profiles.sql`, `supabase/diagrams.sql` — schema + RLS.

## Environment / deploy notes
- Vercel auto-deploys on push to `main`. Env vars set in Vercel project settings.
- Supabase Auth: GitHub OAuth. Site URL + redirect allowlist must include the
  local origin (`http://localhost:3001`) and the deployed URL.
- SECURITY reminder: never paste full OAuth callback URLs (they contain live
  tokens). Just say "it redirected to localhost".

## Scrapped / do-not-repropose
- Image export (PNG/SVG via html-to-image) — removed 2026-07-16; users screenshot
  instead and share via link. Don't re-add without a fundamentally different
  renderer.
- AI-powered prompt generation (too expensive) — only reconsider as
  bring-your-own-key.
- Per-node "assign a real type" dropdown — user asked to remove it. Kept the
  Custom node + color picker instead.
