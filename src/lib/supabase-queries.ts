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
  }));
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  email: string | null; // Menambahkan email untuk tampilan
}

// Antarmuka untuk struktur data mentah yang dikembalikan oleh kueri Supabase
interface RawProfileDataFromSupabase {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  auth_users: { email: string | null } | null; // Data yang digabungkan dari auth.users
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, role, auth_users:auth.users(email)"); // Join dengan auth.users untuk mendapatkan email

  if (error) {
    console.error("Error fetching all profiles:", error.message || JSON.stringify(error, null, 2) || "Unknown error object.");
    return [];
  }

  // Menggunakan type assertion untuk data mentah melalui 'unknown'
  const rawData = data as unknown as RawProfileDataFromSupabase[];

  return rawData.map(profile => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatar_url: profile.avatar_url,
    role: profile.role,
    email: profile.auth_users?.email || null,
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