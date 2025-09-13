import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  id: string;
  site_name: string;
  site_logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  updated_at: string;
}

export async function getAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  if (error) {
    console.error("Error fetching app settings:", error.message || error);
    return null;
  }
  return data;
}

export async function updateAppSettings(settingsData: Partial<Omit<AppSettings, 'id' | 'created_at'>>): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .update({ ...settingsData, updated_at: new Date().toISOString() })
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .select()
    .single();

  if (error) {
    console.error("Error updating app settings:", error.message || error);
    throw error;
  }
  return data;
}