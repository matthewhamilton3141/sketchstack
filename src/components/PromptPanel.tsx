"use client";

import { useState } from "react";

interface PromptPanelProps {
  prompt: string;
  fileName: string;
  onClose: () => void;
}

// Modal-style overlay showing the generated spec with copy + download buttons.
export default function PromptPanel({
  prompt,
  fileName,
  onClose,
}: PromptPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([prompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-2xl flex-col rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--text)]">
            Generated prompt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={download}
              className="rounded-md border border-[var(--border)] px-3 py-1 text-sm font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
            >
              Download
            </button>
            <button
              onClick={copy}
              className="rounded-md bg-[var(--btn-bg)] px-3 py-1 text-sm font-medium text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--text)]"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <pre className="overflow-auto whitespace-pre-wrap p-4 text-sm text-[var(--text)]">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
