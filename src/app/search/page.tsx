"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { searchProducts, type SortOption, Product } from "@/lib/supabase/products"; // Import dari modul products
import { Suspense } from "react";
import { SortDropdown } from "@/components/sort-dropdown";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');

  React.useEffect(() => {
    if (query) {
      const fetchProducts = async () => {
        setIsLoading(true);
        const results = await searchProducts(query, sortOption);
        setProducts(results);
        setIsLoading(false);
      };
      fetchProducts();
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [query, sortOption]);

  const title = query ? `Hasil pencarian untuk "${query}"` : "Silakan masukkan kata kunci pencarian";

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {query && products.length > 0 && <SortDropdown onSortChange={setSortOption} />}
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