# Sketchstack

A visual systems-design canvas that turns a diagram into a structured prompt
for your AI coding agent. Sketch your stack — drag typed components onto a
canvas, wire them together, describe each one — then generate a clean spec you
can paste into Claude Code, Cursor, or any agent. Plan by *seeing* how a system
connects instead of writing plain text.

**Guest-first:** everything except cloud save works with no account.

## Features

- **Interactive canvas** (React Flow) — draggable nodes, connect any dot to any
  dot, reconnect edges, labeled connections, zoom/pan, auto-hiding minimap.
- **Diagram modes** — swap the node pack + generated-prompt template between
  **System Design**, **App / UI Flow**, **Database Schema**, and **Task
  Planning**.
- **50+ typed components** with per-type color + SVG icon, a **Custom** blank
  node, and per-node color override.
- **Notes** — standalone sticky-note cards with bullets + sub-comments, plus
  per-note control over what reaches the prompt.
- **Generate Prompt** — walks the graph into a structured, mode-aware Markdown
  spec (grouped components, connections/relations, bidirectional `↔` merging),
  with copy + download.
- **Learn** — a built-in panel that teaches how to build common architectures
  (how-it-works steps, starter blueprints, and a glossary of every component),
  plus a hover tooltip on each palette item explaining what it is and when to
  use it.
- **Editing power tools** — undo/redo, duplicate, multi-select + align/
  distribute, center-snapping alignment guides.
- **Templates** — one-click starting points (SaaS app, REST API + DB, AI RAG,
  event-driven) you can drag on and compose.
- **Auto-save** to the browser (localStorage); **download/import** a
  `.sketchstack.json` design file.
- **Accounts** — GitHub OAuth sign-in via Supabase with a one-time username.
- **Cloud save** — up to 5 named diagrams per account (overflow stays local).
- **Sharing** — one click to publish a diagram and copy a read-only `/d/<id>`
  link (with rich link previews); visitors get the full diagram, notes expanded,
  and can "Open a copy" into their own canvas.
- **Themes** — light and dark, remembered per browser.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [React Flow](https://reactflow.dev) (`@xyflow/react`) for the canvas
- [Supabase](https://supabase.com) for auth (GitHub OAuth) + Postgres storage
- [lucide-react](https://lucide.dev) for icons
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (http://localhost:3000, or the next free
port such as 3001). Guest features work immediately with no configuration.

### Environment (for auth + cloud save)

Create a `.env.local` (gitignored) with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-anon-key>
```

The app runs fine without these — the sign-in UI just hides until they're set.

### Auth (GitHub OAuth)

1. Create a GitHub OAuth App (github.com/settings/developers) with the
   callback URL `https://<your-project>.supabase.co/auth/v1/callback`.
2. In Supabase → **Authentication → Providers → GitHub**, enable it and paste
   the Client ID + Secret.
3. Add your app URL(s) to **Authentication → URL Configuration** (Site URL +
   redirect allowlist), e.g. `http://localhost:3001` and your deployed URL.

### Database

Run these in the Supabase SQL Editor:

- [`supabase/profiles.sql`](supabase/profiles.sql) — usernames (`profiles`
  table + RLS).
- [`supabase/diagrams.sql`](supabase/diagrams.sql) — cloud-saved + shareable
  diagrams (`diagrams` table + RLS).

## Project layout

```
src/
  app/            App Router (editor page, /d/[id] shared view, layout, styles)
  components/     Canvas, nodes, panels (details/edge/note/cloud/learn), auth, theming
  lib/            node registry, modes, prompt generator, templates, Supabase, cloud
supabase/         SQL schema (profiles, diagrams)
```

## Roadmap

- More per-mode node packs and templates
- Guest sharing (publish a link without an account)
