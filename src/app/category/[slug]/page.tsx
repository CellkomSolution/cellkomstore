"use client";

import * as React from "react";
import { ProductGrid } from "@/components/product-grid";
import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/lib/supabase-queries";
import { Product } from "@/lib/mock-data";

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

  React.useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const fetchedProducts = await getProductsByCategory(slug);
      setProducts(fetchedProducts);
      setIsLoading(false);
    }
    if (categoryName) {
      fetchProducts();
    }
  }, [slug, categoryName]);

  if (!categoryName) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid
        products={products}
        title={`Kategori: ${categoryName}`}
        isLoading={isLoading}
        emptyStateMessage="Oops! Belum ada produk di kategori ini."
        emptyStateDescription=""
      />
    </div>
  );
}