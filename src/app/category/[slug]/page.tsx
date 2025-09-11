"use client";

import * as React from "react";
import { ProductGrid } from "@/components/product-grid";
import { notFound } from "next/navigation";
import { getProductsByCategory, type SortOption } from "@/lib/supabase-queries";
import { Product } from "@/lib/mock-data";
import { SortDropdown } from "@/components/sort-dropdown";

const categoryMap: { [key: string]: string } = {
  "handphone-tablet": "Handphone & Tablet",
  "komputer-laptop": "Komputer & Laptop",
  "pakaian-pria": "Pakaian Pria",
  "perhiasan-logam": "Perhiasan & Logam",
  "kesehatan-kecantikan": "Kesehatan & Kecantikan",
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Menggunakan React.use() untuk meng-unwrap params
  const { slug } = React.use(params);
  const categoryName = categoryMap[slug];

  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState<SortOption>('newest');

  React.useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const fetchedProducts = await getProductsByCategory(slug, sortOption);
      setProducts(fetchedProducts);
      setIsLoading(false);
    }
    if (categoryName) {
      fetchProducts();
    }
  }, [slug, categoryName, sortOption]);

  if (!categoryName) {
    notFound();
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