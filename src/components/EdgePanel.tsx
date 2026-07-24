"use client";

import type { Edge } from "@xyflow/react";

export type EdgeStyle = "solid" | "dashed" | "dotted";

interface EdgePanelProps {
  edge: Edge;
  onChange: (label: string) => void;
  onStyleChange: (style: EdgeStyle) => void;
  onDelete: () => void;
  onClose: () => void;
}

const STYLE_OPTIONS: { value: EdgeStyle; label: string; preview: string }[] = [
  { value: "solid",  label: "Solid (sync)",   preview: "─────" },
  { value: "dashed", label: "Dashed (async)",  preview: "- - -" },
  { value: "dotted", label: "Dotted (event)",  preview: "· · ·" },
];

// Side panel for labelling, styling, or deleting a selected connection.
export default function EdgePanel({
  edge,
  onChange,
  onStyleChange,
  onDelete,
  onClose,
}: EdgePanelProps) {
  const label = typeof edge.label === "string" ? edge.label : "";
  const currentStyle = (edge.data?.edgeStyle as EdgeStyle | undefined) ?? "solid";

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

      <div className="mb-3">
        <span className="mb-1 block text-xs font-medium text-[var(--muted)]">
          Style
        </span>
        <div className="flex flex-col gap-1">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStyleChange(opt.value)}
              className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-xs transition-colors ${
                currentStyle === opt.value
                  ? "border-[var(--text)] bg-[var(--panel-2)] font-medium text-[var(--text)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]"
              }`}
            >
              <span>{opt.label}</span>
              <span className="font-mono tracking-widest">{opt.preview}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="w-full rounded-md border border-red-500/40 px-2 py-1 text-sm text-red-500 hover:bg-red-500/10"
      >
        Delete connection
      </button>
    </div>
  );
}
