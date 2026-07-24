"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { NODE_KINDS } from "@/lib/nodeTypes";
import type { SystemNode } from "@/components/SystemNode";
import type { AppNode } from "@/lib/appNode";

interface SearchPanelProps {
  nodes: AppNode[];
  onFocus: (nodeId: string) => void;
  onClose: () => void;
}

// Canvas search overlay (⌘F). Filters system nodes by name, tech, or notes and
// pans the canvas to the match the user selects.
export default function SearchPanel({
  nodes,
  onFocus,
  onClose,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const systemNodes = nodes.filter(
    (n): n is SystemNode => n.type === "system",
  );

  const q = query.trim().toLowerCase();
  const results =
    q === ""
      ? []
      : systemNodes.filter(
          (n) =>
            n.data.label.toLowerCase().includes(q) ||
            n.data.tech?.toLowerCase().includes(q) ||
            n.data.notes?.toLowerCase().includes(q),
        );

  return (
    <div className="fixed left-1/2 top-20 z-50 w-80 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Search size={14} className="shrink-0 text-[var(--muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes…"
          className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && results.length > 0) {
              onFocus(results[0].id);
            }
          }}
        />
        <button
          onClick={onClose}
          className="shrink-0 text-[var(--muted)] hover:text-[var(--text)]"
        >
          <X size={14} />
        </button>
      </div>

      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto border-t border-[var(--border)]">
          {results.map((n) => {
            const spec = NODE_KINDS[n.data.kind];
            const Icon = spec.icon;
            return (
              <button
                key={n.id}
                onClick={() => { onFocus(n.id); onClose(); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-[var(--panel-2)]"
              >
                <Icon
                  size={13}
                  style={{ color: n.data.color ?? spec.color }}
                  strokeWidth={2.25}
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--text)]">
                    {n.data.label}
                  </div>
                  {n.data.tech ? (
                    <div className="truncate text-xs text-[var(--muted)]">
                      {n.data.tech}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {q !== "" && results.length === 0 && (
        <div className="border-t border-[var(--border)] px-3 py-3 text-sm text-[var(--muted)]">
          No nodes match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
