import { supabase } from "@/integrations/supabase/client";

export interface HeroCarouselSlide {
  id: string;
  product_image_url: string | null;
  alt: string;
  logo_url: string | null;
  product_name: string | null;
  original_price: number | null;
  discounted_price: number | null;
  is_new: boolean;
  hashtag: string | null;
  left_panel_bg_color: string | null;
  order: number;
  display_style: 'full' | 'split';
  link_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getHeroCarouselSlides(): Promise<HeroCarouselSlide[]> {
  const { data, error } = await supabase
    .from("hero_carousel_slides")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching hero carousel slides:", error.message || error);
    return [];
  }
  return data;
}

export async function getHeroCarouselSlideById(id: string): Promise<HeroCarouselSlide | null> {
  const { data, error } = await supabase
    .from("hero_carousel_slides")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching hero carousel slide with ID ${id}:`, error.message || error);
    return null;
  }
  return data;
}

export async function createHeroCarouselSlide(slideData: Omit<HeroCarouselSlide, 'id' | 'created_at' | 'updated_at'>): Promise<HeroCarouselSlide | null> {
  const { data, error } = await supabase
    .from("hero_carousel_slides")
    .insert(slideData)
    .select()
    .single();

  if (error) {
    console.error("Error creating hero carousel slide:", error.message || error);
    throw error;
  }
  return data;
}

export async function updateHeroCarouselSlide(id: string, slideData: Partial<Omit<HeroCarouselSlide, 'id' | 'created_at'>>): Promise<HeroCarouselSlide | null> {
  const { data, error } = await supabase
    .from("hero_carousel_slides")
    .update({ ...slideData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating hero carousel slide with ID ${id}:`, error.message || error);
    throw error;
  }
  return data;
}

export async function deleteHeroCarouselSlide(id: string): Promise<void> {
  const { error } = await supabase
    .from("hero_carousel_slides")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting hero carousel slide with ID ${id}:`, error.message || error);
    throw error;
  }
}