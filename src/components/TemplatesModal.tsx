"use client";

import { TEMPLATES, type Template } from "@/lib/templates";

interface TemplatesModalProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

// Grid of starter templates the user can load onto the canvas.
export default function TemplatesModal({
  onSelect,
  onClose,
}: TemplatesModalProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--text)]">
            Start from a template
          </span>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)]"
            title="Close"
          >
            ✕
          </button>
        </div>
        <p className="mb-3 text-xs text-[var(--muted)]">
          This replaces the current canvas (you can undo with ⌘Z).
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-3 text-left transition-transform hover:scale-[1.02]"
            >
              <div className="text-sm font-semibold text-[var(--text)]">
                {t.name}
              </div>
              <div className="mt-0.5 text-xs text-[var(--muted)]">
                {t.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
