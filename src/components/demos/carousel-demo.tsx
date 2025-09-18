"use client";

import * as React from "react";
import { AnimatedCarousel, LogoItem } from "@/components/ui/logo-carousel";
import { getCategoriesWithLatestProductImage, Category } from "@/lib/supabase/categories";
import { Loader2 } from "lucide-react";

export const CarouselDemo = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      const fetchedCategories = await getCategoriesWithLatestProductImage();
      setCategories(fetchedCategories);
      setIsLoading(false);
    }
    fetchCategories();
  }, []);

  const categoryLogos: LogoItem[] = categories
    .filter(category => category.latest_product_image_url) // Only show categories with an image
    .map(category => ({
      src: category.latest_product_image_url!,
      alt: category.name,
      link: `/category/${category.slug}`,
      name: category.name,
    }));

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-48">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (categoryLogos.length === 0) {
    return (
      <div className="w-full text-center text-muted-foreground py-8">
        Tidak ada kategori untuk ditampilkan di carousel.
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
      <AnimatedCarousel 
        title="Jelajahi Kategori Produk Kami"
        logos={categoryLogos}
        autoPlay={true}
        autoPlayInterval={4000}
        itemsPerViewMobile={3}
        itemsPerViewDesktop={5}
        logoContainerWidth="w-40"
        logoContainerHeight="h-32" // Increased height to accommodate category name
        logoImageWidth="w-auto"
        logoImageHeight="h-20" // Adjusted image height
        logoMaxWidth="max-w-[80%]" // Constrain image width
        logoMaxHeight="max-h-[80%]" // Constrain image height
        padding="py-10 lg:py-16" // Adjusted padding
        spacing="gap-6" // Adjusted spacing
      />
    </div>
  );
};