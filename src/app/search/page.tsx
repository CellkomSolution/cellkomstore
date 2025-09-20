"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { searchProducts, type SortOption, Product } from "@/lib/supabase/products"; // Import dari modul products
import { Suspense } from "react";
import { SortDropdown } from "@/components/sort-dropdown";
import { CategoryFilter } from "@/components/category-filter"; // Import CategoryFilter

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null); // New state for category filter

  React.useEffect(() => {
    if (query) {
      const fetchProducts = async () => {
        setIsLoading(true);
        const results = await searchProducts(query, sortOption, selectedCategory); // Pass selectedCategory
        setProducts(results);
        setIsLoading(false);
      };
      fetchProducts();
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [query, sortOption, selectedCategory]); // Add selectedCategory to dependencies

  const title = query ? `Hasil pencarian untuk "${query}"` : "Silakan masukkan kata kunci pencarian";

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {query && products.length > 0 && <CategoryFilter onCategoryChange={setSelectedCategory} defaultValue={selectedCategory} />}
          {query && products.length > 0 && <SortDropdown onSortChange={setSortOption} />}
        </div>
      </div>
      <ProductGrid
        products={products}
        title=""
        isLoading={isLoading}
        emptyStateMessage={query ? "Produk tidak ditemukan" : "Mulai cari produk impianmu"}
        emptyStateDescription={query ? "Coba gunakan kata kunci yang berbeda." : ""}
      />
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center">Memuat...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}