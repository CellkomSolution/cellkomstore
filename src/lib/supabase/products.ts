import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  location: string;
  rating: number;
  soldCount: string;
  category: string;
  isFlashSale?: boolean;
  description?: string;
}

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