import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  latest_product_image_url?: string | null;
}

export async function getCategories(): Promise<Category[]> {
  // Menggunakan RPC function yang sudah ada untuk mendapatkan gambar produk terbaru
  const { data, error } = await supabase.rpc('get_categories_with_latest_product_image');

  if (error) {
    console.error("Error fetching categories with latest product image:", error.message || error);
    return [];
  }
  // Pastikan data diurutkan seperti sebelumnya
  return (data as Category[]).sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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