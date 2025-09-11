import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  email: string | null;
  bio?: string | null;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, role, email, bio");

  if (error) {
    console.error("Error fetching all profiles:", error.message || error);
    return [];
  }

  return data.map(profile => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatar_url: profile.avatar_url,
    role: profile.role,
    email: profile.email,
    bio: profile.bio,
  }));
}

export async function getTotalUsersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total users count:", error.message || error);
    return 0;
  }
  return count || 0;
}

export async function getAdminUserId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching admin user ID:", error.message || error);
    return null;
  }
  return data?.id || null;
}