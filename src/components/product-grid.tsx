"use client";

import { ProductCard } from "./product-card";
import { useSearch } from "@/context/search-context";
import { Product } from "@/lib/mock-data"; // Import Product interface
import { useState, useEffect } from "react";
import { getProducts } from "@/lib/supabase-queries"; // Import fungsi Supabase

interface ProductGridProps {
  initialProducts: Product[];
  title?: string;
}

export function ProductGrid({ initialProducts, title }: ProductGridProps) {
  const { searchQuery } = useSearch();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  // Re-fetch products if search query changes or initial products are updated
  useEffect(() => {
    // Only filter the main grid based on search, not the category-specific ones
    if (!title) {
      const fetchAndFilterProducts = async () => {
        setIsLoading(true);
        const allProducts = await getProducts(); // Fetch all products from Supabase
        const filtered = allProducts.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setProducts(filtered);
        setIsLoading(false);
      };

      fetchAndFilterProducts();
    }
  }, [searchQuery, title]);

  const gridTitle = title
    ? title
    : searchQuery
    ? `Hasil untuk "${searchQuery}"`
    : "Produk Pilihan Untukmu";

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{gridTitle}</h2>
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Memuat produk...
          </p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Oops! Produk tidak ditemukan.
          </p>
          <p className="text-sm text-muted-foreground">
            Coba gunakan kata kunci lain.
          </p>
        </div>
      )}
    </section>
  );
}