"use client";

import { useState } from "react";

interface PromptPanelProps {
  prompt: string;
  onClose: () => void;
}

// Modal-style overlay showing the generated spec with a copy-to-clipboard button.
export default function PromptPanel({ prompt, onClose }: PromptPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <span className="text-sm font-semibold">Generated prompt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="rounded-md bg-black px-3 py-1 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <pre className="overflow-auto whitespace-pre-wrap p-4 text-sm text-zinc-800 dark:text-zinc-200">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
