# Sketchstack

A visual systems-design tool that turns a diagram into a structured prompt for
your AI coding agent. Sketch your stack: drag typed components onto a canvas,
wire them together, describe each one, then generate a clean spec you can paste
into Claude Code, Cursor, or any agent — so you plan by *seeing* how the system
connects instead of writing plain text.

## Features

- **Interactive canvas** (React Flow) — drag nodes, connect any side to any
  side, zoom, pan, minimap.
- **22 typed components** across four categories (Web/API core, Async & infra,
  External & auth, AI / data), each with its own color and SVG icon.
- **Editable node details** — name, technology (with suggestions), and notes.
- **Generate Prompt** — walks the graph and emits a structured Markdown spec
  (components, tech, connections, data flow) with one-click copy.
- **Auto-save** to the browser (localStorage) so diagrams survive a refresh.
- **Accounts** — passwordless magic-link sign-in via Supabase, with a one-time
  username prompt.
- **Themes** — light, dusk (bluish-grey), and dark, remembered per browser.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [React Flow](https://reactflow.dev) (`@xyflow/react`) for the canvas
- [Supabase](https://supabase.com) for auth + Postgres storage
- [lucide-react](https://lucide.dev) for icons

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (http://localhost:3000, or the next
free port such as 3001).

### Environment

Create a `.env.local` (gitignored) with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-anon-key>
```

For magic-link sign-in to redirect back correctly, add your local URL (e.g.
`http://localhost:3001`) to **Authentication → URL Configuration** in the
Supabase dashboard.

### Database

Run the SQL in [`supabase/profiles.sql`](supabase/profiles.sql) in the Supabase
SQL Editor to create the `profiles` table (usernames) with row-level security.

## Project layout

```
src/
  app/            Next.js App Router (layout, page, global styles)
  components/     Canvas, nodes, panels, auth, theming
  lib/            nodeTypes registry, prompt generator, Supabase client
supabase/         SQL schema
```

## Roadmap

- Cloud-saved diagrams (up to 5 named diagrams per account, overflow local)
- Editable edge labels for richer data-flow in the generated prompt
- Custom SMTP for reliable auth emails
