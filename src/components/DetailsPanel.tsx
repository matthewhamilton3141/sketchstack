"use client";

import { NODE_KINDS, type SystemNodeData } from "@/lib/nodeTypes";
import type { SystemNode } from "@/components/SystemNode";

interface DetailsPanelProps {
  node: SystemNode;
  onChange: (patch: Partial<SystemNodeData>) => void;
  onDelete: () => void;
  onClose: () => void;
}

// Side panel for editing the selected node's name, tech, and notes.
export default function DetailsPanel({
  node,
  onChange,
  onDelete,
  onClose,
}: DetailsPanelProps) {
  const spec = NODE_KINDS[node.data.kind];

  return (
    <div className="w-72 rounded-lg border border-zinc-200 bg-white/95 p-3 shadow-md backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${spec.dot}`} />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {spec.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          title="Close"
        >
          ✕
        </button>
      </div>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-xs font-medium text-zinc-500">Name</span>
        <input
          value={node.data.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Orders service"
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
        />
      </label>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-xs font-medium text-zinc-500">Technology</span>
        <input
          value={node.data.tech ?? ""}
          onChange={(e) => onChange({ tech: e.target.value })}
          placeholder={spec.techHint}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
        />
      </label>

      <label className="mb-3 block">
        <span className="mb-0.5 block text-xs font-medium text-zinc-500">Notes</span>
        <textarea
          value={node.data.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Responsibilities, key endpoints, constraints…"
          rows={4}
          className="w-full resize-none rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
        />
      </label>

      <button
        onClick={onDelete}
        className="w-full rounded-md border border-red-200 px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
      >
        Delete node
      </button>
    </div>
  );
}
