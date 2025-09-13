"use client";

import { useSession } from "@/context/session-context";

export function useAuth() {
  return useSession();
}