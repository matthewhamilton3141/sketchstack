"use client";

import type { Edge } from "@xyflow/react";

interface EdgePanelProps {
  edge: Edge;
  onChange: (label: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

// Side panel for labeling / deleting a selected connection. The label feeds the
// "Connections / Data Flow" section of the generated prompt.
export default function EdgePanel({
  edge,
  onChange,
  onDelete,
  onClose,
}: EdgePanelProps) {
  const label = typeof edge.label === "string" ? edge.label : "";

  return (
    <div className="w-72 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Connection
        </span>
        <button
          onClick={onClose}
          className="text-[var(--muted)] hover:text-[var(--text)]"
          title="Close"
        >
          ✕
        </button>
      </div>

      <label className="mb-3 block">
        <span className="mb-0.5 block text-xs font-medium text-[var(--muted)]">
          Label
        </span>
        <input
          value={label}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. sends POST /orders"
          autoFocus
          className="w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-sm text-[var(--text)] outline-none focus:border-[var(--muted)]"
        />
      </label>

      <button
        onClick={onDelete}
        className="w-full rounded-md border border-red-500/40 px-2 py-1 text-sm text-red-500 hover:bg-red-500/10"
      >
        Delete connection
      </button>
    </div>
  );
}
