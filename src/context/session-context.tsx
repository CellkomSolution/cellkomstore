"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { type Session, type User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { type Profile } from "@/lib/supabase/profiles"; // Import Profile dari modul profiles

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refetchProfile = React.useCallback(async () => {
    if (user) {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Error refetching profile:", error);
      } else {
        setProfile(profileData);
      }
    }
  }, [user]);

  React.useEffect(() => {
    const fetchSessionAndProfile = async (currentSession: Session | null) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .single();
        setProfile(profileData);

        if (pathname === "/auth") {
          router.push("/");
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        if (pathname !== "/auth" && pathname !== "/") {
          router.push("/auth");
        }
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      fetchSessionAndProfile(initialSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        fetchSessionAndProfile(currentSession);
      }
    );

    return () => subscription.unsubscribe();
  }, [pathname, router]);

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
    <SessionContext.Provider value={{ session, user, profile, isLoading, signOut, refetchProfile }}>
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