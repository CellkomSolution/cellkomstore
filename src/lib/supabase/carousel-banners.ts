import { supabase } from "@/integrations/supabase/client";

export interface CarouselBanner {
  id: string;
  image_url: string | null; // Changed to allow null
  title: string | null;
  description: string | null;
  link_url: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export async function getCarouselBanners(): Promise<CarouselBanner[]> {
  const { data, error } = await supabase
    .from("carousel_banners")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching carousel banners:", error.message || error);
    return [];
  }
  return data;
}

export async function getCarouselBannerById(id: string): Promise<CarouselBanner | null> {
  const { data, error } = await supabase
    .from("carousel_banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching carousel banner with ID ${id}:`, error.message || error);
    return null;
  }
  return data;
}

export async function createCarouselBanner(bannerData: Omit<CarouselBanner, 'id' | 'created_at' | 'updated_at'>): Promise<CarouselBanner | null> {
  const { data, error } = await supabase
    .from("carousel_banners")
    .insert({
      ...bannerData,
      image_url: bannerData.image_url || null, // Ensure empty string becomes null
      title: bannerData.title || null,
      description: bannerData.description || null,
      link_url: bannerData.link_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating carousel banner:", error.message || error);
    throw error;
  }
  return data;
}

export async function updateCarouselBanner(id: string, bannerData: Partial<Omit<CarouselBanner, 'id' | 'created_at'>>): Promise<CarouselBanner | null> {
  const updatePayload: Partial<Omit<CarouselBanner, 'id' | 'created_at'>> = {
    ...bannerData,
    updated_at: new Date().toISOString(),
  };

  // Ensure optional fields are null if empty strings are passed
  if (updatePayload.image_url === "") updatePayload.image_url = null; // Ensure empty string becomes null
  if (updatePayload.title === "") updatePayload.title = null;
  if (updatePayload.description === "") updatePayload.description = null;
  if (updatePayload.link_url === "") updatePayload.link_url = null;

  const { data, error } = await supabase
    .from("carousel_banners")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating carousel banner with ID ${id}:`, error.message || error);
    throw error;
  }
  return data;
}

export async function deleteCarouselBanner(id: string): Promise<void> {
  // First, get the banner to retrieve its image_url
  const { data: bannerToDelete, error: fetchError } = await supabase
    .from("carousel_banners")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error(`Error fetching carousel banner for deletion with ID ${id}:`, fetchError.message || fetchError);
    throw fetchError;
  }

  // If an image_url exists, delete the image from storage
  if (bannerToDelete?.image_url) {
    const imageUrlParts = bannerToDelete.image_url.split('/');
    const fileName = imageUrlParts[imageUrlParts.length - 1];
    const { error: storageError } = await supabase.storage
      .from('carousel-banner-images') // Assuming a dedicated bucket for carousel images
      .remove([fileName]);

    if (storageError) {
      console.warn("Failed to delete carousel banner image from storage:", storageError.message);
      // Don't throw error here, proceed with banner deletion even if image deletion fails
    }
  }

  // Then, delete the banner from the database
  const { error: dbError } = await supabase
    .from("carousel_banners")
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error(`Error deleting carousel banner with ID ${id}:`, dbError.message || dbError);
    throw dbError;
  }
}