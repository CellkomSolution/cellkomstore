import { supabase } from "@/integrations/supabase/client";

export interface ProductImage {
  id: string;
  product_id: string;
  imageUrl: string; // Renamed from image_url for consistency
  order: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  mainImageUrl: string; // Renamed from imageUrl
  additionalImages: ProductImage[]; // New field
  location: string;
  rating: number;
  soldCount: string;
  category: string;
  isFlashSale?: boolean;
  description?: string | null;
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
  mainImageUrl: item.main_image_url, // Mapped from main_image_url
  additionalImages: item.product_images ? item.product_images.map((img: any) => ({
    id: img.id,
    product_id: img.product_id,
    imageUrl: img.image_url,
    order: img.order,
  })).sort((a: ProductImage, b: ProductImage) => a.order - b.order) : [], // Map additional images and sort them
  location: item.location,
  rating: item.rating,
  soldCount: item.sold_count,
  category: item.category,
  isFlashSale: item.is_flash_sale,
  description: item.description,
});

export async function getProducts(sort: SortOption = 'newest'): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select(`
      *,
      product_images(id, image_url, order)
    `); // Select additional images
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
    .select(`
      *,
      product_images(id, image_url, order)
    `)
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
    .select(`
      *,
      product_images(id, image_url, order)
    `)
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
    .select(`
      *,
      product_images(id, image_url, order)
    `)
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
    .select(`
      *,
      product_images(id, image_url, order)
    `)
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
export async function createProduct(productData: Omit<Product, 'id' | 'rating' | 'soldCount' | 'additionalImages'>, additionalImageUrls: string[] = []): Promise<Product | null> {
  const { name, price, originalPrice, mainImageUrl, location, category, isFlashSale, description } = productData;
  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      price,
      original_price: originalPrice === 0 ? null : originalPrice,
      main_image_url: mainImageUrl, // Mapped to snake_case
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

  if (data && additionalImageUrls.length > 0) {
    const imagesToInsert = additionalImageUrls.map((url, index) => ({
      product_id: data.id,
      image_url: url,
      order: index + 1, // Start order from 1 for additional images
    }));
    const { error: imagesError } = await supabase.from("product_images").insert(imagesToInsert);
    if (imagesError) {
      console.error("Error inserting additional product images:", imagesError.message);
      // Don't throw, but log the error. Main product creation is more critical.
    }
  }

  // Fetch the product again with all images to return a complete object
  return getProductById(data.id);
}

// New function to update a product
export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'rating' | 'soldCount' | 'additionalImages'>>, additionalImageUpdates: { id?: string; imageUrl: string; order: number; _delete?: boolean }[] = []): Promise<Product | null> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (productData.name !== undefined) updatePayload.name = productData.name;
  if (productData.price !== undefined) updatePayload.price = productData.price;
  if (productData.originalPrice !== undefined) updatePayload.original_price = productData.originalPrice === 0 ? null : productData.originalPrice;
  if (productData.mainImageUrl !== undefined) updatePayload.main_image_url = productData.mainImageUrl; // Mapped to snake_case
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

  // Handle additional image updates
  if (additionalImageUpdates.length > 0) {
    const inserts = additionalImageUpdates.filter(img => !img.id && !img._delete).map((img, index) => ({
      product_id: id,
      image_url: img.imageUrl,
      order: img.order,
    }));
    const updates = additionalImageUpdates.filter(img => img.id && !img._delete).map(img => ({
      id: img.id,
      image_url: img.imageUrl,
      order: img.order,
    }));
    const deletes = additionalImageUpdates.filter(img => img.id && img._delete).map(img => img.id!);

    if (inserts.length > 0) {
      const { error: insertError } = await supabase.from("product_images").insert(inserts);
      if (insertError) console.error("Error inserting product images:", insertError.message);
    }
    if (updates.length > 0) {
      // Perform individual updates for each image to handle `eq('id', ...)`
      for (const img of updates) {
        const { error: updateError } = await supabase.from("product_images").update({
          image_url: img.imageUrl,
          order: img.order,
          updated_at: new Date().toISOString(),
        }).eq("id", img.id);
        if (updateError) console.error(`Error updating product image ${img.id}:`, updateError.message);
      }
    }
    if (deletes.length > 0) {
      // Before deleting from DB, delete from storage
      const { data: imagesToDelete, error: fetchImagesError } = await supabase.from("product_images").select("image_url").in("id", deletes);
      if (fetchImagesError) {
        console.warn("Failed to fetch images for deletion from storage:", fetchImagesError.message);
      } else if (imagesToDelete) {
        const fileNames = imagesToDelete.map(img => img.image_url.split('/').pop()!).filter(Boolean);
        if (fileNames.length > 0) {
          const { error: storageError } = await supabase.storage.from('product-images').remove(fileNames);
          if (storageError) console.warn("Failed to delete product images from storage:", storageError.message);
        }
      }

      const { error: deleteError } = await supabase.from("product_images").delete().in("id", deletes);
      if (deleteError) console.error("Error deleting product images:", deleteError.message);
    }
  }

  // Fetch the product again with all images to return a complete object
  return getProductById(id);
}

// New functions for managing individual product images
export async function createProductImage(productId: string, imageUrl: string, order: number): Promise<ProductImage | null> {
  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, image_url: imageUrl, order })
    .select()
    .single();
  if (error) {
    console.error("Error creating product image:", error.message);
    throw error;
  }
  return {
    id: data.id,
    product_id: data.product_id,
    imageUrl: data.image_url,
    order: data.order,
  };
}

export async function updateProductImage(imageId: string, imageUrl: string, order: number): Promise<ProductImage | null> {
  const { data, error } = await supabase
    .from("product_images")
    .update({ image_url: imageUrl, order, updated_at: new Date().toISOString() })
    .eq("id", imageId)
    .select()
    .single();
  if (error) {
    console.error(`Error updating product image ${imageId}:`, error.message);
    throw error;
  }
  return {
    id: data.id,
    product_id: data.product_id,
    imageUrl: data.image_url,
    order: data.order,
  };
}

export async function deleteProductImage(imageId: string): Promise<void> {
  // First, get the image URL to delete from storage
  const { data: imageData, error: fetchError } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", imageId)
    .single();

  if (fetchError) {
    console.warn(`Failed to fetch image URL for deletion with ID ${imageId}:`, fetchError.message);
    // Proceed with DB deletion even if storage fetch fails
  } else if (imageData?.image_url) {
    const fileName = imageData.image_url.split('/').pop()!;
    const { error: storageError } = await supabase.storage.from('product-images').remove([fileName]);
    if (storageError) {
      console.warn(`Failed to delete product image ${fileName} from storage:`, storageError.message);
    }
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) {
    console.error(`Error deleting product image ${imageId}:`, error.message);
    throw error;
  }
}

export { mapProductData };