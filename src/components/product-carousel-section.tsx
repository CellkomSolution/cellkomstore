"use client";

import React, { useEffect, useState } from "react";
import { CardCarousel } from "@/components/ui/card-carousel";
import { getProducts, Product } from "@/lib/supabase/products";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function ProductCarouselSection() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestProducts() {
      setIsLoading(true);
      // Fetch products sorted by newest, limit to a reasonable number for carousel
      const products = await getProducts('newest');
      setLatestProducts(products.slice(0, 10)); // Display up to 10 latest products
      setIsLoading(false);
    }
    fetchLatestProducts();
  }, []);

  const carouselImages = latestProducts
    .filter(product => product.imageUrl) // Only include products with an image
    .map(product => ({
      src: product.imageUrl!, // Non-null assertion as we filtered
      alt: product.name,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (carouselImages.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Tidak ada produk terbaru untuk ditampilkan di carousel.
      </div>
    );
  }

  return (
    <CardCarousel
      images={carouselImages}
      autoplayDelay={2500}
      showPagination={true}
      showNavigation={false} // Navigation can be intrusive on smaller carousels
      title="Produk Terbaru"
      description="Jelajahi koleksi produk terbaru kami yang menarik!"
    />
  );
}