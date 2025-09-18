"use client";

import React, { useEffect, useState } from "react";
import { CardCarousel } from "@/components/ui/card-carousel";
import { getProducts, Product } from "@/lib/supabase/products";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronRight } from "lucide-react"; // Import ChevronRight
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import Link from "next/link"; // Import Link

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
      <Card className="p-4 rounded-lg border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Produk Terbaru</CardTitle>
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (carouselImages.length === 0) {
    return (
      <Card className="p-4 rounded-lg border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Produk Terbaru</CardTitle>
          <Link href="/new-arrivals" className="text-sm font-semibold text-primary hover:underline flex items-center">
            Lihat Semua <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          Tidak ada produk terbaru untuk ditampilkan di carousel.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card p-4 rounded-lg border">
      <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
        <CardTitle className="text-xl font-bold">Produk Terbaru</CardTitle>
        <Link href="/new-arrivals" className="text-sm font-semibold text-primary hover:underline flex items-center">
          Lihat Semua <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <CardCarousel
          images={carouselImages}
          autoplayDelay={2500}
          showPagination={true}
          showNavigation={false}
        />
      </CardContent>
    </Card>
  );
}