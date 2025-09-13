import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  id: string;
  site_name: string | null;
  site_logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  updated_at: string | null;
}

export async function getAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001") // Assuming a fixed ID for global settings
    .single();

  if (error) {
    console.error("Error fetching app settings:", error.message);
    return null;
  }

  return data;
}