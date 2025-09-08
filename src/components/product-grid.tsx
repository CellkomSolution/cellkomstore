"use client";

import { ProductCard } from "./product-card";
import { Product } from "@/lib/mock-data";
import { ProductCardSkeleton } from "./product-card-skeleton"; // Import ProductCardSkeleton

interface ProductGridProps {
  products: Product[];
  title: string;
  isLoading?: boolean;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
}

export function ProductGrid({ 
  products, 
  title, 
  isLoading = false,
  emptyStateMessage = "Oops! Produk tidak ditemukan.",
  emptyStateDescription = "Coba gunakan kata kunci lain."
}: ProductGridProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => ( // Menampilkan 6 skeleton
            <ProductCardSkeleton key={index} />
          ))}
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
            {emptyStateMessage}
          </p>
          <p className="text-sm text-muted-foreground">
            {emptyStateDescription}
          </p>
        </div>
      )}
    </section>
  );
}