"use client";

import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getProducts, Product } from "@/lib/supabase/products";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ProductGradientCard } from "./product-gradient-card"; // Import the new component

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

  if (latestProducts.length === 0) {
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
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {latestProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <ProductGradientCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}