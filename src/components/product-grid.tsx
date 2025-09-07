"use client";

import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "./product-card";
import { useSearch } from "@/context/search-context";

export function ProductGrid() {
  const { searchQuery } = useSearch();

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        {searchQuery ? `Hasil untuk "${searchQuery}"` : "Produk Pilihan Untukmu"}
      </h2>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredProducts.map((product) => (
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