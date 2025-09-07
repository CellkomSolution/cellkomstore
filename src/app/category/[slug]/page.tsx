"use client";

import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/lib/supabase-queries"; // Import fungsi Supabase
import { Product } from "@/lib/mock-data"; // Import Product interface

const categoryMap: { [key: string]: string } = {
  "handphone-tablet": "Handphone & Tablet",
  "komputer-laptop": "Komputer & Laptop",
  "pakaian-pria": "Pakaian Pria",
  "perhiasan-logam": "Perhiasan & Logam",
  "kesehatan-kecantikan": "Kesehatan & Kecantikan",
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
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
    fetchProducts();
  }, [slug]);

  if (!categoryName) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Kategori: {categoryName}</h1>
      <p className="text-muted-foreground mb-6">
        {isLoading ? "Memuat..." : `Menampilkan ${products.length} produk.`}
      </p>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">Memuat produk...</p>
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
            Oops! Belum ada produk di kategori ini.
          </p>
        </div>
      )}
    </div>
  );
}