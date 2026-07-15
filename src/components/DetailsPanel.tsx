"use client";

import { NODE_KINDS, type SystemNodeData } from "@/lib/nodeTypes";
import type { SystemNode } from "@/components/SystemNode";

interface DetailsPanelProps {
  node: SystemNode;
  onChange: (patch: Partial<SystemNodeData>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-sm text-[var(--text)] outline-none focus:border-[var(--muted)]";

// Side panel for editing the selected node's name, tech, and notes.
export default function DetailsPanel({
  node,
  onChange,
  onDuplicate,
  onDelete,
  onClose,
}: DetailsPanelProps) {
  const spec = NODE_KINDS[node.data.kind];
  const Icon = spec.icon;
  // Turn the tech hint ("Postgres, MongoDB…") into autocomplete suggestions.
  const techSuggestions = spec.techHint
    .replace(/…/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="w-72 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color: spec.color }} strokeWidth={2.25} />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {spec.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--muted)] hover:text-[var(--text)]"
          title="Close"
        >
          ✕
        </button>
      </div>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-xs font-medium text-[var(--muted)]">
          Name
        </span>
        <input
          value={node.data.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Orders service"
          className={inputClass}
        />
      </label>

      <div className="mb-2">
        <span className="mb-0.5 block text-xs font-medium text-[var(--muted)]">
          Color
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={node.data.color ?? spec.color}
            onChange={(e) => onChange({ color: e.target.value })}
            aria-label="Node color"
            className="h-7 w-10 cursor-pointer rounded border border-[var(--border)] bg-transparent"
          />
          <span className="text-xs text-[var(--muted)]">
            {node.data.color ?? spec.color}
          </span>
          {node.data.color ? (
            <button
              onClick={() => onChange({ color: undefined })}
              className="ml-auto text-[10px] font-medium text-[var(--muted)] hover:text-[var(--text)]"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-xs font-medium text-[var(--muted)]">
          Technology
        </span>
        <input
          value={node.data.tech ?? ""}
          onChange={(e) => onChange({ tech: e.target.value })}
          placeholder={spec.techHint}
          list={`tech-${node.data.kind}`}
          className={inputClass}
        />
        <datalist id={`tech-${node.data.kind}`}>
          {techSuggestions.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>

      <label className="mb-3 block">
        <span className="mb-0.5 block text-xs font-medium text-[var(--muted)]">
          Notes
        </span>
        <textarea
          value={node.data.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Responsibilities, key endpoints, constraints…"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={onDuplicate}
          className="flex-1 rounded-md border border-[var(--border)] px-2 py-1 text-sm text-[var(--text)] hover:bg-[var(--panel-2)]"
        >
          Duplicate
        </button>
        <button
          onClick={onDelete}
          className="flex-1 rounded-md border border-red-500/40 px-2 py-1 text-sm text-red-500 hover:bg-red-500/10"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
