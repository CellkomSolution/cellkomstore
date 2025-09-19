"use client";

import React, { useEffect, useState } from "react";
import { getProductsByCategories, Product } from "@/lib/supabase/products";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ProductCardCarousel } from "./product-card-carousel";

export function UsedProductsCarousel() {
  const [usedProducts, setUsedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsedProducts() {
      setIsLoading(true);
      const categoriesToFetch = ["hp-bekas", "laptop-bekas", "produk-bekas"];
      const products = await getProductsByCategories(categoriesToFetch, 'newest');
      setUsedProducts(products.slice(0, 10)); // Display up to 10 used products
      setIsLoading(false);
    }
    fetchUsedProducts();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-4 rounded-lg border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Produk Bekas Pilihan</CardTitle>
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (usedProducts.length === 0) {
    return (
      <Card className="p-4 rounded-lg border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Produk Bekas Pilihan</CardTitle>
          <Link href="/search?q=bekas" className="text-sm font-semibold text-primary hover:underline flex items-center">
            Lihat Semua <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          Tidak ada produk bekas untuk ditampilkan.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card p-4 rounded-lg border">
      <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
        <CardTitle className="text-xl font-bold">Produk Bekas Pilihan</CardTitle>
        <Link href="/search?q=bekas" className="text-sm font-semibold text-primary hover:underline flex items-center">
          Lihat Semua <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ProductCardCarousel
          products={usedProducts}
          autoplayDelay={3000}
          showPagination={true}
          showNavigation={true}
          options={{
            slidesToScroll: 1,
            breakpoints: {
              '(min-width: 640px)': { slidesToScroll: 2 },
              '(min-width: 768px)': { slidesToScroll: 3 },
              '(min-width: 1024px)': { slidesToScroll: 4 },
              '(min-width: 1280px)': { slidesToScroll: 5 },
            }
          }}
        />
      </CardContent>
    </Card>
  );
}