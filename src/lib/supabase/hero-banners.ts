import { supabase } from "@/integrations/supabase/client";

export interface HeroBanner {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getHeroBanners(onlyActive: boolean = true): Promise<HeroBanner[]> {
  let query = supabase
    .from("hero_banners")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching hero banners:", error.message || error);
    return [];
  }
  return data;
}

export async function getHeroBannerById(id: string): Promise<HeroBanner | null> {
  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching hero banner with ID ${id}:`, error.message || error);
    return null;
  }
  return data;
}

export async function createHeroBanner(bannerData: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>): Promise<HeroBanner | null> {
  const { data, error } = await supabase
    .from("hero_banners")
    .insert({
      ...bannerData,
      description: bannerData.description ?? null,
      button_text: bannerData.button_text ?? null,
      button_link: bannerData.button_link ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating hero banner:", error.message || error);
    throw error;
  }
  return data;
}

export async function updateHeroBanner(id: string, bannerData: Partial<Omit<HeroBanner, 'id' | 'created_at'>>): Promise<HeroBanner | null> {
  const updatePayload: Partial<Omit<HeroBanner, 'id' | 'created_at'>> = {
    ...bannerData,
    updated_at: new Date().toISOString(),
  };

  // Ensure nullable fields are set to null if empty string
  if (updatePayload.description === "") updatePayload.description = null;
  if (updatePayload.button_text === "") updatePayload.button_text = null;
  if (updatePayload.button_link === "") updatePayload.button_link = null;

  const { data, error } = await supabase
    .from("hero_banners")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating hero banner with ID ${id}:`, error.message || error);
    throw error;
  }
  return data;
}

export async function deleteHeroBanner(id: string): Promise<void> {
  // First, get the banner to retrieve its image_url
  const { data: bannerToDelete, error: fetchError } = await supabase
    .from("hero_banners")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error(`Error fetching hero banner for deletion with ID ${id}:`, fetchError.message || fetchError);
    throw fetchError;
  }

  // If an image_url exists, delete the image from storage
  if (bannerToDelete?.image_url) {
    const imageUrlParts = bannerToDelete.image_url.split('/');
    const fileName = imageUrlParts[imageUrlParts.length - 1];
    const { error: storageError } = await supabase.storage
      .from('hero-banner-images') // Use a dedicated bucket for hero banners
      .remove([fileName]);

    if (storageError) {
      console.warn("Failed to delete hero banner image from storage:", storageError.message);
      // Don't throw error here, proceed with banner deletion even if image deletion fails
    }
  }

  // Then, delete the banner from the database
  const { error: dbError } = await supabase
    .from("hero_banners")
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error(`Error deleting hero banner with ID ${id}:`, dbError.message || dbError);
    throw dbError;
  }
}