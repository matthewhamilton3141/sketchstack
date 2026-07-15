"use client";

import { useAuth } from "@/components/AuthProvider";
import UsernameModal from "@/components/UsernameModal";

// Shows the username prompt only when a signed-in user has no username yet.
export default function UsernameGate() {
  const { user, profile, loading, refreshProfile } = useAuth();

  // Wait until we know who's signed in and have loaded their profile.
  if (loading || !user || !profile) return null;
  if (profile.username) return null;

  return <UsernameModal userId={user.id} onDone={refreshProfile} />;
}
