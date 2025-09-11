import { supabase } from "@/integrations/supabase/client";
import { Product } from "./mock-data"; // Menggunakan interface Product yang sudah ada

export type SortOption = 'newest' | 'popularity' | 'price-asc' | 'price-desc';

const applySorting = (query: any, sort: SortOption) => {
  switch (sort) {
    case 'price-asc':
      return query.order('price', { ascending: true });
    case 'price-desc':
      return query.order('price', { ascending: false });
    case 'popularity':
      return query.order('sold_count', { ascending: false });
    case 'newest':
    default:
      return query.order('created_at', { ascending: false });
  }
};

const mapProductData = (item: any): Product => ({
  id: item.id,
  name: item.name,
  price: item.price,
  originalPrice: item.original_price,
  imageUrl: item.image_url,
  location: item.location,
  rating: item.rating,
  soldCount: item.sold_count,
  category: item.category,
  isFlashSale: item.is_flash_sale,
  description: item.description,
});

export async function getProducts(sort: SortOption = 'newest'): Promise<Product[]> {
  let query = supabase.from("products").select("*");
  query = applySorting(query, sort);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error.message || error);
    return [];
  }

  return data.map(mapProductData);
}

export async function getFlashSaleProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_flash_sale", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching flash sale products:", error.message || error);
    return [];
  }

  return data.map(mapProductData);
}

export async function getProductsByCategory(categorySlug: string, sort: SortOption = 'newest'): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .eq("category", categorySlug);
  
  query = applySorting(query, sort);

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error.message || error);
    return [];
  }

  return data.map(mapProductData);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message || error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapProductData(data);
}

export async function searchProducts(query: string, sort: SortOption = 'newest'): Promise<Product[]> {
  let dbQuery = supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`);

  dbQuery = applySorting(dbQuery, sort);

  const { data, error } = await dbQuery;

  if (error) {
    console.error("Error searching products:", error.message || error);
    return [];
  }

  return data.map(mapProductData);
}

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

export async function getTotalProductsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total products count:", error.message || error);
    return 0;
  }
  return count || 0;
}

export async function getTotalUsersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("profiles") // Assuming each user has a profile
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total users count:", error.message || error);
    return 0;
  }
  return count || 0;
}

// --- Hero Carousel Slides Management ---

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

// --- Category Management ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  latest_product_image_url?: string | null; // Ditambahkan
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching categories:", error.message || error);
    return [];
  }
  return data;
}

export async function getCategoriesWithLatestProductImage(): Promise<Category[]> {
  const { data, error } = await supabase.rpc('get_categories_with_latest_product_image');

  if (error) {
    console.error("Error fetching categories with latest product image:", error.message || error);
    return [];
  }
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    // Log error.message if available, otherwise the full error object
    console.error(`Error fetching category with slug ${slug}:`, error.message || error);
    return null;
  }
  return data;
}

export async function createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'latest_product_image_url'>): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error.message || error);
    throw error;
  }
  return data;
}

export async function updateCategory(id: string, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'latest_product_image_url'>>): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .update({ ...categoryData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating category with ID ${id}:`, error.message || error);
    throw error;
  }
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting category with ID ${id}:`, error.message || error);
    throw error;
  }
}

// --- App Settings Management ---

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
    .eq("id", "00000000-0000-0000-0000-000000000001") // Fetch the single settings row
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
    .eq("id", "00000000-0000-0000-0000-000000000001") // Update the single settings row
    .select()
    .single();

  if (error) {
    console.error("Error updating app settings:", error.message || error);
    throw error;
  }
  return data;
}