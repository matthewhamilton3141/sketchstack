"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

// Header widget: shows the signed-in email + sign out, or a sign-in button.
export default function AuthBar() {
  const { user, profile, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return <span className="text-sm text-zinc-400">…</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted)]">
          {profile?.username ? `@${profile.username}` : user.email}
        </span>
        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-md border border-[var(--border)] px-3 py-1 text-sm text-[var(--text)] hover:bg-[var(--panel-2)]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="rounded-md bg-[var(--btn-bg)] px-3 py-1 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
      >
        Sign in
      </button>
      {showModal ? <AuthModal onClose={() => setShowModal(false)} /> : null}
    </>
  );
}
