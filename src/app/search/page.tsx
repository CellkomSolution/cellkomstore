"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { searchProducts } from "@/lib/supabase-queries";
import { Product } from "@/lib/mock-data";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (query) {
      const fetchProducts = async () => {
        setIsLoading(true);
        const results = await searchProducts(query);
        setProducts(results);
        setIsLoading(false);
      };
      fetchProducts();
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [query]);

  return (
    <ProductGrid
      products={products}
      title={query ? `Hasil pencarian untuk "${query}"` : "Silakan masukkan kata kunci pencarian"}
      isLoading={isLoading}
      emptyStateMessage={query ? "Produk tidak ditemukan" : "Mulai cari produk impianmu"}
      emptyStateDescription={query ? "Coba gunakan kata kunci yang berbeda." : ""}
    />
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