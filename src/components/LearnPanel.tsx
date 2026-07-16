"use client";

import {
  NODE_KINDS,
  paletteGroups,
  type DiagramMode,
  type NodeKind,
} from "@/lib/nodeTypes";
import { TEMPLATES, type Template } from "@/lib/templates";

interface LearnPanelProps {
  mode: DiagramMode;
  onUseTemplate: (t: Template) => void;
  onClose: () => void;
}

const STEPS = [
  "Pick a mode (System, App flow, Database, Planning) — the palette adapts to it.",
  "Drag components from the palette onto the canvas, or click to drop one in.",
  "Connect them: drag from a node's dot to another to draw a labeled arrow.",
  "Add sticky notes for context, then Generate Prompt to hand it to an AI agent.",
];

// The unique node kinds a template uses, in first-seen order.
function templateKinds(t: Template): NodeKind[] {
  const seen = new Set<NodeKind>();
  const kinds: NodeKind[] = [];
  for (const node of t.nodes) {
    const k = node.data.kind;
    if (!seen.has(k)) {
      seen.add(k);
      kinds.push(k);
    }
  }
  return kinds;
}

// Teaching panel: how to build a diagram, starter blueprints, and a glossary of
// every component in the current mode (reuses the node descriptions + templates).
export default function LearnPanel({
  mode,
  onUseTemplate,
  onClose,
}: LearnPanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--text)]">
            Learn · build a system design
          </span>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)]"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {/* How it works */}
          <section className="mb-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              How it works
            </h3>
            <ol className="space-y-1.5">
              {STEPS.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--text)]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--panel-2)] text-[11px] font-semibold text-[var(--muted)]">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Starter blueprints */}
          <section className="mb-5">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Start from a blueprint
            </h3>
            <p className="mb-2 text-[11px] text-[var(--muted)]">
              Common architectures you can drop in and tweak (these build a System
              diagram).
            </p>
            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-[var(--border)] p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--text)]">
                      {t.name}
                    </span>
                    <button
                      onClick={() => onUseTemplate(t)}
                      className="shrink-0 rounded-md bg-[var(--btn-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
                    >
                      Use this
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {t.description}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {templateKinds(t).map((k) => {
                      const spec = NODE_KINDS[k];
                      const Icon = spec.icon;
                      return (
                        <span
                          key={k}
                          style={{
                            borderColor: spec.color,
                            backgroundColor: `${spec.color}1a`,
                          }}
                          className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium text-[var(--text)]"
                        >
                          <Icon
                            size={11}
                            style={{ color: spec.color }}
                            strokeWidth={2.25}
                          />
                          {spec.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Component glossary for the current mode */}
          <section>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Component glossary
            </h3>
            <p className="mb-2 text-[11px] text-[var(--muted)]">
              Every building block available in the current mode — what it is and
              when to reach for it.
            </p>
            <div className="space-y-3">
              {paletteGroups(mode).map(({ category, kinds }) => (
                <div key={category}>
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)] opacity-70">
                    {category}
                  </div>
                  <div className="space-y-1.5">
                    {kinds.map((spec) => {
                      const Icon = spec.icon;
                      return (
                        <div key={spec.kind} className="flex gap-2">
                          <Icon
                            size={14}
                            style={{ color: spec.color }}
                            strokeWidth={2.25}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-[var(--text)]">
                              {spec.label}
                            </span>
                            <span className="text-[11px] leading-snug text-[var(--muted)]">
                              {" — "}
                              {spec.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
