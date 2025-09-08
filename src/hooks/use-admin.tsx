"use client";

import * as React from "react";
import { useSession } from "@/context/session-context";
import { supabase } from "@/integrations/supabase/client";

export function useAdmin() {
  const { user, isLoading: isSessionLoading } = useSession();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isAdminLoading, setIsAdminLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAdminStatus() {
      if (isSessionLoading) return;

      if (!user) {
        setIsAdmin(false);
        setIsAdminLoading(false);
        return;
      }

      setIsAdminLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setIsAdmin(false);
      } else if (data) {
        setIsAdmin(data.role === "admin");
      } else {
        setIsAdmin(false);
      }
      setIsAdminLoading(false);
    }

    checkAdminStatus();
  }, [user, isSessionLoading]);

  return { isAdmin, isAdminLoading };
}