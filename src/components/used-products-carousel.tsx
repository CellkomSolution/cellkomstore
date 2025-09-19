"use client";

import * as React from "react";
import { CustomCarousel, CustomCarouselItem } from "@/components/ui/custom-carousel";
import { getProductsByCategory, Product } from "@/lib/supabase/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils"; // Import formatRupiah

export function UsedProductsCarousel() {
  const [carouselItems, setCarouselItems] = React.useState<CustomCarouselItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUsedProducts() {
      setIsLoading(true);
      const categories = ["hp-bekas", "laptop-bekas", "produk-bekas"];
      let allUsedProducts: Product[] = [];

      for (const categorySlug of categories) {
        const products = await getProductsByCategory(categorySlug);
        allUsedProducts = [...allUsedProducts, ...products];
      }

      // Map Product to CustomCarouselItem with full details
      const mappedItems: CustomCarouselItem[] = allUsedProducts.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description || `Harga: ${formatRupiah(product.price)}`, // Fallback description
        imageUrl: product.imageUrl,
        linkUrl: `/product/${product.id}`,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating,
        soldCount: product.soldCount,
        location: product.location,
      }));

      setCarouselItems(mappedItems);
      setIsLoading(false);
    }
    fetchUsedProducts();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-4 rounded-lg border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Produk Bekas Pilihan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (carouselItems.length === 0) {
    return (
      <Card className="p-4 rounded-lg border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Produk Bekas Pilihan</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          Tidak ada produk bekas untuk ditampilkan.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4"> {/* Container for carousel */}
      {/* Removed h2 tag for "Produk Bekas Pilihan" */}
      <CustomCarousel
        items={carouselItems}
        autoplay={true}
        autoplayDelay={4000}
        pauseOnHover={true}
        loop={true}
        showNavigation={true}
        showPagination={true}
        options={{
          slidesToScroll: 1,
          breakpoints: {
            '(min-width: 640px)': { slidesToScroll: 2 },
            '(min-width: 768px)': { slidesToScroll: 3 },
            '(min-width: 1024px)': { slidesToScroll: 4 },
            '(min-width: 1280px)': { slidesToScroll: 5 },
          }
        }}
        itemClassName="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6" // Match ProductGrid item width
        imageHeightClass="h-48" // Match ProductCard image height
      />
    </div>
  );
}