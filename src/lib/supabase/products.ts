import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null; // Changed to allow null
  imageUrl: string | null; // Changed to allow null
  location: string;
  rating: number;
  soldCount: string;
  category: string;
  isFlashSale?: boolean;
  description?: string | null; // Changed to allow null
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
  imageUrl: item.main_image_url, // Corrected to main_image_url
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

// New function to get products by multiple categories
export async function getProductsByCategories(categorySlugs: string[], sort: SortOption = 'newest'): Promise<Product[]> {
  if (categorySlugs.length === 0) {
    return [];
  }

  let query = supabase
    .from("products")
    .select("*")
    .in("category", categorySlugs);
  
  query = applySorting(query, sort);

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching products for categories ${categorySlugs.join(', ')}:`, error.message || error);
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

// New function to create a product
export async function createProduct(productData: Omit<Product, 'id' | 'rating' | 'soldCount'>): Promise<Product | null> {
  const { name, price, originalPrice, imageUrl, location, category, isFlashSale, description } = productData;
  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      price,
      original_price: originalPrice === 0 ? null : originalPrice,
      main_image_url: imageUrl || null, // Corrected to main_image_url and convert empty string to null
      location,
      category,
      is_flash_sale: isFlashSale, // Mapped to snake_case
      description,
      rating: 0, // Default rating
      sold_count: "0", // Default sold count
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error.message || error);
    throw error;
  }
  return mapProductData(data);
}

// New function to update a product
export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'rating' | 'soldCount'>>): Promise<Product | null> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (productData.name !== undefined) updatePayload.name = productData.name;
  if (productData.price !== undefined) updatePayload.price = productData.price;
  if (productData.originalPrice !== undefined) updatePayload.original_price = productData.originalPrice === 0 ? null : productData.originalPrice;
  if (productData.imageUrl !== undefined) updatePayload.main_image_url = productData.imageUrl === "" ? null : productData.imageUrl; // Corrected to main_image_url and convert empty string to null
  if (productData.location !== undefined) updatePayload.location = productData.location;
  if (productData.category !== undefined) updatePayload.category = productData.category;
  if (productData.isFlashSale !== undefined) updatePayload.is_flash_sale = productData.isFlashSale; // Mapped to snake_case
  if (productData.description !== undefined) updatePayload.description = productData.description;

  const { data, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product with ID ${id}:`, error.message || error);
    throw error;
  }
  return mapProductData(data);
}

export { mapProductData };