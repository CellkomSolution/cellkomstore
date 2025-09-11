"use client";

import { useSession } from "@/context/session-context";

export function useAdmin() {
  const { profile, isLoading: isSessionLoading } = useSession();

  const isAdmin = profile?.role === "admin";
  const isAdminLoading = isSessionLoading;

  return { isAdmin, isAdminLoading };
}