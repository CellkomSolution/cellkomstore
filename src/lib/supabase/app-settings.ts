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
  scrolling_text_enabled: boolean | null; // New field
  scrolling_text_content: string | null;  // New field
  right_header_text_enabled: boolean | null; // New field
  right_header_text_content: string | null;  // New field
  right_header_text_link: string | null;     // New field
}

export async function getAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  if (error) {
    console.error("Error fetching app settings:", error);
    return null;
  }

  return data;
}

export async function updateAppSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .update(settings)
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .select()
    .single();

  if (error) {
    console.error("Error updating app settings:", error);
    return null;
  }

  return data;
}