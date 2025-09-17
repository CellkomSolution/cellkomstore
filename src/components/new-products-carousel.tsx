"use client";

import * as React from "react";
import { CardCarousel } from "@/components/ui/card-carousel";
import { getProducts, Product } from "@/lib/supabase/products";
import { Loader2 } from "lucide-react";

export function NewProductsCarousel() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNewProducts() {
      setIsLoading(true);
      // Mengambil produk dengan opsi pengurutan 'newest'
      const fetchedProducts = await getProducts('newest'); 
      setProducts(fetchedProducts.slice(0, 5)); // Ambil 5 produk terbaru
      setIsLoading(false);
    }
    fetchNewProducts();
  }, []);

  const carouselImages = products
    .filter(product => product.imageUrl)
    .map(product => ({
      src: product.imageUrl!,
      alt: product.name,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (carouselImages.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Belum ada produk baru untuk ditampilkan.
      </div>
    );
  }

  return (
    <CardCarousel
      images={carouselImages}
      autoplayDelay={2500}
      showPagination={true}
      showNavigation={true}
      title="Produk Terbaru"
      description="Jelajahi koleksi produk terbaru kami!"
    />
  );
}