"use client";

import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { notFound } from "next/navigation";

const categoryMap: { [key: string]: string } = {
  "handphone-tablet": "Handphone & Tablet",
  "komputer-laptop": "Komputer & Laptop",
  "pakaian-pria": "Pakaian Pria",
  "perhiasan-logam": "Perhiasan & Logam",
  "kesehatan-kecantikan": "Kesehatan & Kecantikan",
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryName = categoryMap[params.slug];

  if (!categoryName) {
    notFound();
  }

  const filteredProducts = mockProducts.filter(
    (product) => product.category === params.slug
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Kategori: {categoryName}</h1>
      <p className="text-muted-foreground mb-6">
        Menampilkan {filteredProducts.length} produk.
      </p>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredProducts.map((product) => (
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