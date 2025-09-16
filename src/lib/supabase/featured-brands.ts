import { supabase } from "@/integrations/supabase/client";

export interface FeaturedBrand {
  id: string;
  image_url: string | null; // Changed to allow null
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
    .insert({
      ...brandData,
      image_url: brandData.image_url ?? null, // Convert empty string to null
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating featured brand:", error.message || error);
    throw error;
  }
  return data;
}

export async function updateFeaturedBrand(id: string, brandData: Partial<Omit<FeaturedBrand, 'id' | 'created_at'>>): Promise<FeaturedBrand | null> {
  const updatePayload: Partial<Omit<FeaturedBrand, 'id' | 'created_at'>> = {
    ...brandData,
    updated_at: new Date().toISOString(),
  };

  // Ensure image_url is null if it's an empty string
  if (updatePayload.image_url === "") {
    updatePayload.image_url = null;
  }

  const { data, error } = await supabase
    .from("featured_brands")
    .update(updatePayload)
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
  // First, get the brand to retrieve its image_url
  const { data: brandToDelete, error: fetchError } = await supabase
    .from("featured_brands")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error(`Error fetching featured brand for deletion with ID ${id}:`, fetchError.message || fetchError);
    throw fetchError;
  }

  // If an image_url exists, delete the image from storage
  if (brandToDelete?.image_url) {
    const imageUrlParts = brandToDelete.image_url.split('/');
    const fileName = imageUrlParts[imageUrlParts.length - 1];
    const { error: storageError } = await supabase.storage
      .from('featured-brand-images')
      .remove([fileName]);

    if (storageError) {
      console.warn("Failed to delete featured brand image from storage:", storageError.message);
      // Don't throw error here, proceed with brand deletion even if image deletion fails
    }
  }

  // Then, delete the brand from the database
  const { error: dbError } = await supabase
    .from("featured_brands")
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error(`Error deleting featured brand with ID ${id}:`, dbError.message || dbError);
    throw dbError;
  }
}