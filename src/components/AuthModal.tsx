"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Passwordless sign-in: enter email, receive a magic link.
export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const send = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Return the user to this app after they click the link.
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-lg font-semibold text-[var(--text)]">
          Sign in to Sketchstack
        </div>

        {status === "sent" ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Check your inbox — we sent a magic link to{" "}
            <span className="font-medium text-[var(--text)]">{email}</span>.
            Click it to sign in.
          </p>
        ) : (
          <>
            <p className="mb-3 mt-1 text-sm text-[var(--muted)]">
              Enter your email and we&apos;ll send you a one-click sign-in link.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="you@example.com"
              autoFocus
              className="w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--muted)]"
            />
            {status === "error" ? (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            ) : null}
            <button
              onClick={send}
              disabled={status === "sending"}
              className="mt-3 w-full rounded-md bg-[var(--btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)] disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
