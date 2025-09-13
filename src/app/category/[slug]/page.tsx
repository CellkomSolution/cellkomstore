"use client";

import * as React from "react";
import { ProductGrid } from "@/components/product-grid";
import { notFound } from "next/navigation";
import { getProductsByCategory, Product, SortOption } from "@/lib/supabase/products"; // Import Product, getProductsByCategory, SortOption dari modul products
import { getCategoryBySlug, Category } from "@/lib/supabase/categories"; // Import getCategoryBySlug, Category dari modul categories
import { SortDropdown } from "@/components/sort-dropdown";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  const [categoryName, setCategoryName] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');

  React.useEffect(() => {
    async function fetchCategoryAndProducts() {
      setIsLoading(true);
      
      const category = await getCategoryBySlug(slug);
      if (!category) {
        notFound();
        return;
      }
      setCategoryName(category.name);

      const fetchedProducts = await getProductsByCategory(slug, sortOption);
      setProducts(fetchedProducts);
      setIsLoading(false);
    }
    
    fetchCategoryAndProducts();
  }, [slug, sortOption]);

  if (isLoading && !categoryName) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-muted rounded w-[180px] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{`Kategori: ${categoryName}`}</h1>
        <SortDropdown onSortChange={setSortOption} />
      </div>
      <ProductGrid
        products={products}
        title=""
        isLoading={isLoading}
        emptyStateMessage="Oops! Belum ada produk di kategori ini."
        emptyStateDescription=""
      />
    </div>
  );
}