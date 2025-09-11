"use client";

import * as React from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getCategoriesWithLatestProductImage, Category } from "@/lib/supabase/categories"; // Import dari modul categories
import { icons, Tag, Loader2 } from "lucide-react";
import Image from "next/image";

function CategoryIcon({ name }: { name: string | null }) {
  const Icon = icons[name as keyof typeof icons] || Tag;
  return <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary" />;
}

export function CategoryIcons() {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Tidak ada kategori yang ditemukan.
      </div>
    );
  }

  return (
    <div className="relative px-10">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {categories.map((category, index) => (
            <CarouselItem key={index} className="pl-2 basis-auto">
              <Link
                href={`/category/${category.slug}`}
                className="flex flex-col items-center justify-start space-y-2 text-center group w-24"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted group-hover:bg-primary/10 transition-colors relative overflow-hidden">
                  {category.latest_product_image_url ? (
                    <Image
                      src={category.latest_product_image_url}
                      alt={category.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform group-hover:scale-110"
                      sizes="(max-width: 768px) 10vw, 5vw"
                    />
                  ) : (
                    <CategoryIcon name={category.icon_name} />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors h-10 flex items-center text-center w-full justify-center">
                  {category.name}
                </p>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex" />
      </Carousel>
    </div>
  );
}