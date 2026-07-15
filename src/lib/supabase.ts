import { createClient } from "@supabase/supabase-js";

// Browser Supabase client. The URL and publishable key are injected at build
// time from env (NEXT_PUBLIC_* vars are safe to expose to the browser).
//
// If they're missing we fall back to a harmless placeholder rather than
// throwing: the app is guest-first, so it must still build and run (design,
// export, prompt) without Supabase configured — only auth/cloud save need it.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "Supabase env vars missing — sign-in and cloud save are disabled. Set " +
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable them.",
  );
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
);
