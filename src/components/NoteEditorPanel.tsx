"use client";

import { StickyNote, Plus, X } from "lucide-react";
import {
  NOTE_COLOR,
  type NoteBullet,
  type NoteNode,
  type NoteNodeData,
} from "@/components/NoteNode";

interface NoteEditorPanelProps {
  node: NoteNode;
  onChange: (patch: Partial<NoteNodeData>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-sm text-[var(--text)] outline-none focus:border-[var(--muted)]";

const INCLUDE_OPTIONS: { value: NoteNodeData["promptInclude"]; label: string }[] =
  [
    { value: "none", label: "None" },
    { value: "bullets", label: "Bullets" },
    { value: "full", label: "Full" },
  ];

let bulletCounter = 0;
const newBullet = (): NoteBullet => ({
  id: `nb-${Date.now()}-${bulletCounter++}`,
  text: "",
  children: [],
});

export default function NoteEditorPanel({
  node,
  onChange,
  onDuplicate,
  onDelete,
  onClose,
}: NoteEditorPanelProps) {
  const bullets = node.data.bullets;
  const setBullets = (next: NoteBullet[]) => onChange({ bullets: next });

  const mapBullet = (i: number, fn: (b: NoteBullet) => NoteBullet) =>
    setBullets(bullets.map((b, idx) => (idx === i ? fn(b) : b)));

  return (
    <div className="flex max-h-[calc(100vh-6rem)] w-72 flex-col overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={15} style={{ color: NOTE_COLOR }} strokeWidth={2.25} />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Note
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

      {/* Prompt inclusion */}
      <div className="mb-3">
        <span className="mb-0.5 block text-xs font-medium text-[var(--muted)]">
          Include in prompt
        </span>
        <div className="flex gap-0.5 rounded-md border border-[var(--border)] p-0.5">
          {INCLUDE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ promptInclude: opt.value })}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium ${
                node.data.promptInclude === opt.value
                  ? "bg-[var(--panel-2)] text-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bullets */}
      <div className="space-y-3">
        {bullets.map((b, i) => (
          <div key={b.id} className="rounded-md border border-[var(--border)] p-2">
            <div className="flex items-center gap-1">
              <span className="text-[var(--muted)]">•</span>
              <input
                value={b.text}
                onChange={(e) => mapBullet(i, (x) => ({ ...x, text: e.target.value }))}
                placeholder="Bullet point"
                className={inputClass}
              />
              <button
                onClick={() => setBullets(bullets.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded p-1 text-[var(--muted)] hover:text-red-500"
                title="Delete bullet"
              >
                <X size={14} />
              </button>
            </div>

            {b.children.map((c, j) => (
              <div key={j} className="mt-1 flex items-center gap-1 pl-4">
                <span className="text-[var(--muted)]">–</span>
                <input
                  value={c}
                  onChange={(e) =>
                    mapBullet(i, (x) => ({
                      ...x,
                      children: x.children.map((cc, cj) =>
                        cj === j ? e.target.value : cc,
                      ),
                    }))
                  }
                  placeholder="Sub-comment"
                  className={inputClass}
                />
                <button
                  onClick={() =>
                    mapBullet(i, (x) => ({
                      ...x,
                      children: x.children.filter((_, cj) => cj !== j),
                    }))
                  }
                  className="shrink-0 rounded p-1 text-[var(--muted)] hover:text-red-500"
                  title="Delete sub-comment"
                >
                  <X size={13} />
                </button>
              </div>
            ))}

            <button
              onClick={() =>
                mapBullet(i, (x) => ({ ...x, children: [...x.children, ""] }))
              }
              className="mt-1 ml-4 flex items-center gap-1 text-[10px] font-medium text-[var(--muted)] hover:text-[var(--text)]"
            >
              <Plus size={11} /> sub-comment
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setBullets([...bullets, newBullet()])}
        className="mt-2 flex items-center justify-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
      >
        <Plus size={13} /> Add bullet
      </button>

      <div className="mt-3 flex gap-2">
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
