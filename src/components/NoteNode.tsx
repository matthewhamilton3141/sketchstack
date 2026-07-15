"use client";

import { memo } from "react";
import { StickyNote } from "lucide-react";
import type { NodeProps, Node } from "@xyflow/react";

// Accent color for notes (amber), used by the card and the palette chip.
export const NOTE_COLOR = "#f59e0b";

export interface NoteBullet {
  id: string;
  text: string;
  children: string[]; // sub-comments shown on hover
}

export interface NoteNodeData {
  bullets: NoteBullet[];
  promptInclude: "none" | "bullets" | "full";
  [key: string]: unknown; // React Flow requires an index signature on node data
}

export type NoteNode = Node<NoteNodeData, "note">;

// A standalone sticky-note card. Shows bullet headlines; each bullet's
// sub-comments are hidden until you hover that bullet.
function NoteNodeComponent({ data, selected }: NodeProps<NoteNode>) {
  return (
    <div
      style={{ borderColor: NOTE_COLOR }}
      className={`min-w-[180px] max-w-[280px] rounded-xl border-2 bg-[var(--panel)] px-3 py-2 shadow-md ${
        selected ? "ring-2 ring-offset-1 ring-[var(--muted)]" : ""
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <StickyNote size={14} style={{ color: NOTE_COLOR }} strokeWidth={2.25} />
        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
          Note
        </span>
      </div>

      {data.bullets.length === 0 ? (
        <div className="text-xs text-[var(--muted)]">
          Empty note — select to edit.
        </div>
      ) : (
        <ul className="space-y-0.5">
          {data.bullets.map((b) => (
            <li key={b.id} className="group/bullet text-sm text-[var(--text)]">
              <div className="flex gap-1.5">
                <span className="text-[var(--muted)]">•</span>
                <span>{b.text.trim() || "…"}</span>
              </div>
              {b.children.length > 0 ? (
                <ul className="ml-4 hidden list-disc space-y-0.5 pl-1 text-xs text-[var(--muted)] group-hover/bullet:block">
                  {b.children.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(NoteNodeComponent);
