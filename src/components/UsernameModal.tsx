"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface UsernameModalProps {
  userId: string;
  onDone: () => void; // called after a username is saved (to refresh profile)
}

// Shown once, right after a user's first sign-in, to claim a username.
export default function UsernameModal({ userId, onDone }: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState("");

  const save = async () => {
    const value = username.trim();
    // Simple client-side validation; the DB also enforces uniqueness.
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      setError("3–20 characters: letters, numbers, or underscores.");
      return;
    }
    setStatus("saving");
    setError("");
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, username: value });
    if (error) {
      // 23505 = unique violation (username already taken).
      setError(
        error.code === "23505"
          ? "That username is taken — try another."
          : error.message,
      );
      setStatus("idle");
      return;
    }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xl">
        <div className="text-lg font-semibold text-[var(--text)]">
          Pick a username
        </div>
        <p className="mb-3 mt-1 text-sm text-[var(--muted)]">
          This is how you&apos;ll be shown in Sketchstack. You can only set it
          once for now.
        </p>
        <div className="flex items-center rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2">
          <span className="text-sm text-[var(--muted)]">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="yourname"
            autoFocus
            className="w-full bg-transparent px-1 py-2 text-sm text-[var(--text)] outline-none"
          />
        </div>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        <button
          onClick={save}
          disabled={status === "saving"}
          className="mt-3 w-full rounded-md bg-[var(--btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)] disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
