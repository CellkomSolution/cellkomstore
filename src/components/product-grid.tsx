"use client";

import { ProductCard } from "./product-card";
import { Product } from "@/lib/supabase/products";
import { ProductCardSkeleton } from "./product-card-skeleton";
import React from "react"; // Import React

interface ProductGridProps {
  products: Product[];
  title: string;
  isLoading?: boolean;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  leadingComponent?: React.ReactNode; // New prop for a component to render first
}

export function ProductGrid({ 
  products, 
  title, 
  isLoading = false,
  emptyStateMessage = "Oops! Produk tidak ditemukan.",
  emptyStateDescription = "Coba gunakan kata kunci lain.",
  leadingComponent, // Destructure the new prop
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
      ) : products.length > 0 || leadingComponent ? ( // Render grid if products or leadingComponent exists
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {leadingComponent && (
            <div className="col-span-full sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1"> {/* Ensure it takes full width on small screens, then 1 column */}
              {leadingComponent}
            </div>
          )}
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