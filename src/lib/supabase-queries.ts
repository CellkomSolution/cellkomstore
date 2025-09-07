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