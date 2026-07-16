"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  NODE_KINDS,
  MODE_KINDS,
  type DiagramMode,
  type NodeKind,
  type NodeKindSpec,
} from "@/lib/nodeTypes";

// ⌘K component picker: search, arrow to navigate, Enter to add — no mouse
// needed. Lists the node kinds available in the current mode.
export default function CommandPalette({
  mode,
  onSelect,
  onClose,
}: {
  mode: DiagramMode;
  onSelect: (kind: NodeKind, label: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  const all: NodeKindSpec[] = useMemo(
    () => [...MODE_KINDS[mode], "custom" as NodeKind].map((k) => NODE_KINDS[k]),
    [mode],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.kind.toLowerCase().includes(q),
    );
  }, [all, query]);

  // Keep the highlighted row visible as you arrow through the list.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (spec?: NodeKindSpec) => {
    if (spec) onSelect(spec.kind, spec.label);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a component"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search components…"
          aria-label="Search components"
          className="w-full border-b border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
        />
        <div className="max-h-72 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-[var(--muted)]">
              No components match “{query}”.
            </div>
          ) : (
            results.map((spec, i) => {
              const Icon = spec.icon;
              const isActive = i === active;
              return (
                <button
                  key={spec.kind}
                  ref={isActive ? activeRef : null}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(spec)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${
                    isActive ? "bg-[var(--panel-2)]" : ""
                  }`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${spec.color}22`, color: spec.color }}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[var(--text)]">
                      {spec.label}
                    </span>
                    <span className="block truncate text-xs text-[var(--muted)]">
                      {spec.category}
                    </span>
                  </span>
                  {isActive ? (
                    <span className="shrink-0 text-[10px] font-medium text-[var(--muted)]">
                      ↵ add
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-1.5 text-[10px] text-[var(--muted)]">
          <span>↑↓ navigate · ↵ add · esc close</span>
          <span>
            {results.length} component{results.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
