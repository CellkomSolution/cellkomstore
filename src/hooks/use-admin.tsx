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
        // Log the error in a way that always shows content
        console.error("Error fetching user role:", error.message || JSON.stringify(error, null, 2) || "Unknown error object.");
        // The subsequent detailed logs are still useful if message exists
        if (error.message) console.error("Error message:", error.message);
        if (error.details) console.error("Error details:", error.details);
        if (error.hint) console.error("Error hint:", error.hint);
        if (error.code) console.error("Error code:", error.code); // Add code as well
        setIsAdmin(false);
      } else if (data) {
        setIsAdmin(data.role === "admin");
      } else {
        // No profile found for the user, default to not admin
        setIsAdmin(false);
      }
      setIsAdminLoading(false);
    }

    checkAdminStatus();
  }, [user, isSessionLoading]);

  return { isAdmin, isAdminLoading };
}