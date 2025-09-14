"use client";

import * as React from "react";
import { ProductGrid } from "@/components/product-grid";
import { getProducts, Product } from "@/lib/supabase/products"; // Import Product dan getProducts

export default function NewArrivalsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNewProducts() {
      setIsLoading(true);
      // Mengambil produk dengan opsi pengurutan 'newest' secara default
      const fetchedProducts = await getProducts('newest'); 
      setProducts(fetchedProducts);
      setIsLoading(false);
    }
    fetchNewProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Produk Baru</h1>
      <ProductGrid
        products={products}
        title="Temukan koleksi terbaru kami!"
        isLoading={isLoading}
        emptyStateMessage="Belum ada produk baru yang ditambahkan."
        emptyStateDescription="Nantikan produk-produk menarik lainnya!"
      />
    </div>
  );
}