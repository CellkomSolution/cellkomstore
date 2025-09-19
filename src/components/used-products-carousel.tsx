"use client";

import * as React from "react";
import { CustomCarousel, CustomCarouselItem } from "@/components/ui/custom-carousel";
import { getProductsByCategory, Product } from "@/lib/supabase/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";

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

      // Map Product to CustomCarouselItem
      const mappedItems: CustomCarouselItem[] = allUsedProducts.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description || `Harga: ${product.price}`, // Fallback description
        imageUrl: product.imageUrl,
        linkUrl: `/product/${product.id}`,
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
    <section>
      <h2 className="text-2xl font-bold mb-4">Produk Bekas Pilihan</h2>
      <div className="flex justify-center"> {/* Center the carousel */}
        <CustomCarousel
          items={carouselItems}
          autoplay={true}
          autoplayDelay={4000}
          pauseOnHover={true}
          loop={true}
          baseWidth={300} // Fixed baseWidth for internal calculations
        />
      </div>
    </section>
  );
}