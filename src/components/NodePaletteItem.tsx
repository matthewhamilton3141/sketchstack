"use client";

import { useRef, useState, type DragEvent } from "react";
import { createPortal } from "react-dom";
import type { NodeKindSpec } from "@/lib/nodeTypes";

// A palette chip with a styled hover tooltip explaining what the node kind is
// and when to use it. The tooltip renders in a portal with fixed positioning so
// it isn't clipped by the palette's overflow-y-auto scroll container.
export default function NodePaletteItem({
  spec,
  onAdd,
  onDragStart,
}: {
  spec: NodeKindSpec;
  onAdd: () => void;
  onDragStart: (e: DragEvent) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);
  const Icon = spec.icon;

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ top: r.top, left: r.right + 8 });
  };
  const hide = () => setTip(null);

  return (
    <>
      <button
        ref={ref}
        draggable
        onDragStart={(e) => {
          onDragStart(e);
          hide();
        }}
        onClick={onAdd}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ borderColor: spec.color, backgroundColor: `${spec.color}1a` }}
        className="flex cursor-grab items-center gap-1 rounded-md border px-1.5 py-1 text-xs font-medium text-[var(--text)] transition-transform hover:scale-[1.03] active:cursor-grabbing"
      >
        <Icon size={13} style={{ color: spec.color }} strokeWidth={2.25} />
        {spec.label}
      </button>
      {tip
        ? createPortal(
            <div
              style={{ top: tip.top, left: tip.left }}
              className="pointer-events-none fixed z-[60] w-56 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2.5 shadow-xl"
            >
              <div className="mb-1 flex items-center gap-1.5">
                <Icon
                  size={13}
                  style={{ color: spec.color }}
                  strokeWidth={2.25}
                />
                <span className="text-xs font-semibold text-[var(--text)]">
                  {spec.label}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-[var(--muted)]">
                {spec.description}
              </p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
