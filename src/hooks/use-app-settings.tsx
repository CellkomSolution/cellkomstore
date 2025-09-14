"use client";

import * as React from "react";
import { getAppSettings, AppSettings } from "@/lib/supabase/app-settings";

export function useAppSettings() {
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      setError(null);
      try {
        const settings = await getAppSettings();
        setAppSettings(settings);
      } catch (err: any) {
        console.error("Error fetching app settings in hook:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return { data: appSettings, isLoading, error };
}