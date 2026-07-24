"use client";

import type { GroupNode } from "@/components/GroupNode";

interface GroupPanelProps {
  node: GroupNode;
  onChange: (label: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

// Side panel for labelling / deleting a selected group node.
export default function GroupPanel({
  node,
  onChange,
  onDelete,
  onClose,
}: GroupPanelProps) {
  return (
    <div className="w-72 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Group
        </span>
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
          Label
        </span>
        <input
          value={node.data.label}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Frontend Layer"
          autoFocus
          className="w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-sm text-[var(--text)] outline-none focus:border-[var(--muted)]"
        />
      </label>

      <p className="mb-3 rounded-md bg-[var(--panel-2)] px-2 py-1.5 text-[11px] leading-snug text-[var(--muted)]">
        Drag nodes inside this group — they&apos;ll move with it. Resize by
        dragging the corners when selected.
      </p>

      <button
        onClick={onDelete}
        className="w-full rounded-md border border-red-500/40 px-2 py-1 text-sm text-red-500 hover:bg-red-500/10"
      >
        Delete group
      </button>
    </div>
  );
}
