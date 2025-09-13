"use client";

import { useSession } from "@/context/session-context";

export function useAuth() {
  const { user, signOut, isLoading } = useSession();
  return { user, signOut, isLoading };
}