"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Provider } from "@supabase/supabase-js";

// Brand marks inline so we don't depend on a brand-icon package.
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.36-1.34-1.72-1.34-1.72-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.22 1.84 1.22 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02 0 2.04.14 3 .4 2.28-1.53 3.29-1.21 3.29-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.36.81 1.09.81 2.2v3.24c0 .31.22.68.83.56C20.57 21.88 24 17.49 24 12.29 24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

// Sign-in providers. Default scopes share just the user's email + public
// profile — nothing more. Each must be enabled in Supabase to work. (Google
// was intentionally left out — its OAuth setup wasn't worth it for now.)
const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  { id: "github", label: "Continue with GitHub", icon: <GitHubIcon /> },
];

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState("");

  const signIn = async (provider: Provider) => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
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
        <p className="mb-4 mt-1 text-sm text-[var(--muted)]">
          Only needed to save diagrams to the cloud. We just read your email and
          profile.
        </p>

        <div className="flex flex-col gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => signIn(p.id)}
              className="flex items-center justify-center gap-2 rounded-md bg-[var(--btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}
