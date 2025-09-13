import { supabase } from "@/integrations/supabase/client";

export interface FeaturedBrand {
  id: string;
  image_url: string;
  link_url: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export async function getFeaturedBrands(): Promise<FeaturedBrand[]> {
  const { data, error } = await supabase
    .from("featured_brands")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching featured brands:", error.message || error);
    return [];
  }
  return data;
}

export async function getFeaturedBrandById(id: string): Promise<FeaturedBrand | null> {
  const { data, error } = await supabase
    .from("featured_brands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching featured brand with ID ${id}:`, error.message || error);
    return null;
  }
  return data;
}

export async function createFeaturedBrand(brandData: Omit<FeaturedBrand, 'id' | 'created_at' | 'updated_at'>): Promise<FeaturedBrand | null> {
  const { data, error } = await supabase
    .from("featured_brands")
    .insert(brandData)
    .select()
    .single();

  if (error) {
    console.error("Error creating featured brand:", error.message || error);
    throw error;
  }
  return data;
}

export async function updateFeaturedBrand(id: string, brandData: Partial<Omit<FeaturedBrand, 'id' | 'created_at'>>): Promise<FeaturedBrand | null> {
  const { data, error } = await supabase
    .from("featured_brands")
    .update({ ...brandData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating featured brand with ID ${id}:`, error.message || error);
    throw error;
  }
  return data;
}

export async function deleteFeaturedBrand(id: string): Promise<void> {
  const { error } = await supabase
    .from("featured_brands")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting featured brand with ID ${id}:`, error.message || error);
    throw error;
  }
}