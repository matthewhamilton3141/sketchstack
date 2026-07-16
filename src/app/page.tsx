import Link from "next/link";
import {
  Server,
  Monitor,
  Database,
  ListTodo,
  MousePointerClick,
  Sparkles,
  Layers,
  Network,
} from "lucide-react";
import AuthBar from "@/components/AuthBar";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderLinks from "@/components/HeaderLinks";

// The brand gradient, matching the logo (blue -> amber -> rose).
const BRAND_GRADIENT = "linear-gradient(90deg,#4285f4,#f5a623,#d96570)";

// Diagram modes Sketchstack supports; mirrors MODES in src/lib/modes.ts.
const MODES = [
  { icon: Server, label: "System Design", blurb: "Services, queues, DBs, LLMs — the whole architecture." },
  { icon: Monitor, label: "App / UI Flow", blurb: "Screens, actions, and navigation between them." },
  { icon: Database, label: "Database Schema", blurb: "Tables, relations, and types as models or migrations." },
  { icon: ListTodo, label: "Task Planning", blurb: "Work items and dependencies as an ordered plan." },
];

const STEPS = [
  { icon: MousePointerClick, title: "Sketch", blurb: "Drag nodes onto the canvas and connect them. Start from a template or a blank slate." },
  { icon: Network, title: "Connect", blurb: "Label the edges with the data flow, actions, or relationships between components." },
  { icon: Sparkles, title: "Generate", blurb: "Sketchstack turns the diagram into a clean, structured prompt — ready to hand to your agent." },
];

export default function Landing() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[var(--bg)] text-[var(--text)]">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--panel)]/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="" width={28} height={28} className="rounded-[7px]" />
            <span className="text-lg font-semibold tracking-tight">
              Sketch<span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>stack</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-5 sm:flex">
            <a href="#features" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">Features</a>
            <a href="#how" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">How it works</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <HeaderLinks />
          <ThemeToggle />
          <AuthBar />
          <Link
            href="/new"
            className="rounded-md bg-[var(--btn-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
          >
            Open app
          </Link>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            <Sparkles size={13} /> Diagrams → agent-ready prompts
          </span>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Sketch your stack.
            <br />
            Ship the{" "}
            <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              prompt
            </span>
            .
          </h1>
          <p className="max-w-md text-lg text-[var(--muted)]">
            Draw your system as a diagram, and Sketchstack turns it into a clean,
            structured prompt your AI coding agent can build from — no more
            hand-writing specs.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--btn-bg)] px-5 py-3 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
            >
              Start sketching
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--panel-2)]"
            >
              See how it works
            </a>
          </div>
          <p className="text-xs text-[var(--muted)]">Free to use · No sign-up required to start</p>
        </div>

        {/* Hero visual: mini diagram -> prompt */}
        <div className="relative">
          <div
            className="absolute -inset-6 -z-10 rounded-3xl opacity-20 blur-2xl"
            style={{ background: BRAND_GRADIENT }}
          />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xl">
            {/* mini diagram */}
            <div className="relative h-40 rounded-xl bg-[var(--panel-2)]">
              <svg viewBox="0 0 320 160" className="h-full w-full">
                <g stroke="var(--edge)" strokeWidth="2.5" fill="none">
                  <path d="M78 46 L210 80" />
                  <path d="M210 80 L78 116" />
                </g>
                <g>
                  <rect x="34" y="30" width="60" height="34" rx="9" fill="#4285f4" />
                  <rect x="182" y="63" width="60" height="34" rx="9" fill="#f5a623" />
                  <rect x="34" y="100" width="60" height="34" rx="9" fill="#d96570" />
                  <circle cx="64" cy="47" r="5" fill="#fff" />
                  <circle cx="212" cy="80" r="5" fill="#fff" />
                  <circle cx="64" cy="117" r="5" fill="#fff" />
                </g>
              </svg>
            </div>
            {/* generated prompt */}
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-4 font-mono text-[11px] leading-relaxed text-[var(--muted)]">
              <div className="text-[var(--text)]"># System Design</div>
              <div>## Components</div>
              <div>- Chat UI (Frontend)</div>
              <div>- Backend (API)</div>
              <div>- Vector DB (pgvector)</div>
              <div className="mt-1">## Data Flow</div>
              <div>- Backend → Vector DB: retrieve context</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features / modes ---- */}
      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">One canvas, four ways to think</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[var(--muted)]">
          Each mode gives you a tailored palette and a prompt written for the job.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map(({ icon: Icon, label, blurb }) => (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: BRAND_GRADIENT }}>
                <Icon size={20} color="#fff" />
              </div>
              <h3 className="mt-4 font-semibold">{label}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{blurb}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { icon: Layers, title: "Start from templates", blurb: "SaaS app, REST API, RAG pipeline, event-driven — drop one in and tweak." },
            { icon: Sparkles, title: "Agent-ready prompts", blurb: "Structured markdown with components, connections, and build instructions." },
            { icon: Network, title: "Save & share", blurb: "Keep diagrams in the cloud and share a read-only link with anyone." },
          ].map(({ icon: Icon, title, blurb }) => (
            <div key={title} className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <Icon size={22} className="mt-0.5 shrink-0 text-[var(--muted)]" />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how" className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">From sketch to spec in three steps</h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, blurb }, i) => (
            <div key={title} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  {i + 1}
                </span>
                <Icon size={20} className="text-[var(--muted)]" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-[var(--muted)]">{blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-8">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--panel)] px-8 py-16 text-center">
          <div className="absolute -inset-1 -z-10 opacity-10" style={{ background: BRAND_GRADIENT }} />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to sketch your stack?</h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
            Open the canvas and turn your next system into a prompt in minutes.
          </p>
          <Link
            href="/new"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
          >
            Open Sketchstack
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ---- Meet the creator ---- */}
      <section id="creator" className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-24">
        <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:items-stretch">
          {/* avatar block — the wide panel */}
          <div className="flex h-56 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 sm:h-auto sm:w-auto sm:flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/matthew.jpg"
              alt="Matthew Hamilton"
              width={200}
              height={200}
              loading="lazy"
              className="h-full w-full rounded-xl object-cover"
            />
          </div>

          {/* info / social block — same dimensions as the photo panel */}
          <article className="flex w-full flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center sm:flex-1 sm:text-left">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Matthew Hamilton</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                University of Waterloo, Systems Design Engineering
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Building Sketchstack to turn system diagrams into clean, agent-ready prompts.
              </p>
            </div>

            {/* full-width labeled social rows */}
            <div className="mt-auto flex flex-col gap-2">
                {[
                  {
                    href: "https://github.com/matthewhamilton3141",
                    label: "GitHub",
                    icon: (
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.01.28-2.09 0-3.09 0 0-.79-.25-2.65 1.01A9.64 9.64 0 0 0 12 3c-2.35 0-4.27 1.02-5.4 2.01-1.86-1.26-2.65-1.01-2.65-1.01-.28 1-.28 2.09 0 3.09A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    ),
                  },
                  {
                    href: "https://linkedin.com/in/matthewhamilton3141",
                    label: "LinkedIn",
                    icon: (
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    ),
                  },
                  {
                    href: "https://instagram.com/mxtth2w",
                    label: "Instagram",
                    icon: (
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    ),
                  },
                  {
                    href: "https://matthewhamilton.dev",
                    label: "Portfolio",
                    icon: (
                      <svg viewBox="0 0 800 1000" width="15" height="18" fill="currentColor" aria-hidden="true">
                        <polygon points="400,0 456,215 400,312 344,215" />
                        <polygon points="0,183 283,222 186,253 371,995" />
                        <polygon points="800,183 517,222 614,253 429,995" />
                      </svg>
                    ),
                  },
                ].map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    aria-label={`Matthew Hamilton ${label}`}
                    className="group relative flex w-full items-center gap-3 overflow-hidden rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-transparent hover:text-white"
                  >
                    <span
                      className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ background: BRAND_GRADIENT }}
                    />
                    <span className="relative flex w-5 justify-center">{icon}</span>
                    <span className="relative">{label}</span>
                    <svg className="relative ml-auto opacity-60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </a>
                ))}
              </div>
          </article>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] sm:flex-row">
          <span>
            © {new Date().getFullYear()}{" "}
            <a href="https://github.com/matthewhamilton3141/sketchstack" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)]">
              Sketchstack
            </a>{" "}
            — MIT License
          </span>
          <div className="flex items-center gap-4">
            <Link href="/new" className="hover:text-[var(--text)]">Open app</Link>
            <a href="https://github.com/matthewhamilton3141/sketchstack" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)]">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
