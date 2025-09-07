"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/integrations/supabase/client";
import { type Session, type User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          if (pathname === "/auth") {
            router.push("/"); // Redirect authenticated users from auth page to home
          }
        } else {
          setSession(null);
          setUser(null);
          if (pathname !== "/auth") {
            router.push("/auth"); // Redirect unauthenticated users to auth page
          }
        }
        setIsLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        if (pathname === "/auth") {
          router.push("/");
        }
      } else {
        if (pathname !== "/auth") {
          router.push("/auth");
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, supabase.auth]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal keluar: " + error.message);
    } else {
      toast.success("Berhasil keluar!");
      router.push("/auth");
    }
  };

  return (
    <SessionContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}