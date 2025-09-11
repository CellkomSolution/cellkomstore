import { supabase } from "@/integrations/supabase/client";
import { Product } from "./mock-data"; // Menggunakan interface Product yang sudah ada

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data.map(item => ({
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
  }));
}

export async function getFlashSaleProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_flash_sale", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching flash sale products:", error);
    return [];
  }

  return data.map(item => ({
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
  }));
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", categorySlug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    return [];
  }

  return data.map(item => ({
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
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    price: data.price,
    originalPrice: data.original_price,
    imageUrl: data.image_url,
    location: data.location,
    rating: data.rating,
    soldCount: data.sold_count,
    category: data.category,
    isFlashSale: data.is_flash_sale,
    description: data.description,
  };
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }

  return data.map(item => ({
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
  }));
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
    console.error("Error fetching all profiles:", error.message || JSON.stringify(error, null, 2) || "Unknown error object.");
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
    console.error("Error fetching total products count:", error);
    return 0;
  }
  return count || 0;
}

export async function getTotalUsersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("profiles") // Assuming each user has a profile
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total users count:", error);
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
    console.error("Error fetching hero carousel slides:", error);
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
    console.error(`Error fetching hero carousel slide with ID ${id}:`, error);
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
    console.error("Error creating hero carousel slide:", error);
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
    console.error(`Error updating hero carousel slide with ID ${id}:`, error);
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
    console.error(`Error deleting hero carousel slide with ID ${id}:`, error);
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
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

export async function getCategoriesWithLatestProductImage(): Promise<Category[]> {
  const { data, error } = await supabase.rpc('get_categories_with_latest_product_image');

  if (error) {
    console.error("Error fetching categories with latest product image:", error);
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
    console.error(`Error fetching category with slug ${slug}:`, error);
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
    console.error("Error creating category:", error);
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
    console.error(`Error updating category with ID ${id}:`, error);
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
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
}