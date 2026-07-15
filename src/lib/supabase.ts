import { createClient } from "@supabase/supabase-js";

// Browser Supabase client. The URL and publishable key are injected at build
// time from .env.local (NEXT_PUBLIC_* vars are safe to expose to the browser).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
  );
}

export const supabase = createClient(url, anonKey);
