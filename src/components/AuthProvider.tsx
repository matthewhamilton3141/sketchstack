"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import UsernameGate from "@/components/UsernameGate";

interface Profile {
  username: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  // The user's profile row (null until loaded, or if the table isn't set up yet).
  profile: Profile | null;
  // Re-fetch the profile, e.g. after the user picks a username.
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  profile: null,
  refreshProfile: async () => {},
});

// Hook any component can call to read the current auth state.
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const user = session?.user ?? null;

  useEffect(() => {
    // Read any existing session on load (e.g. returning from a magic link).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Then keep it in sync as the user signs in / out.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      // Table not set up yet, or a transient error — don't block the app.
      setProfile(null);
      return;
    }
    setProfile({ username: data?.username ?? null });
  }, [user]);

  // Load the profile whenever the signed-in user changes.
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{ session, user, loading, profile, refreshProfile }}
    >
      {children}
      <UsernameGate />
    </AuthContext.Provider>
  );
}
