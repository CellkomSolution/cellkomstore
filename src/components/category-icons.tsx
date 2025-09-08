"use client";

import * as React from "react";
import {
  LayoutGrid,
  Megaphone,
  Receipt,
  ShoppingBasket,
  Smartphone,
  HeartPulse,
  Truck,
  Shirt,
  Gem,
  Baby,
  Car,
} from "lucide-react";
import * as LucideIcons from "lucide-react"; // Import all Lucide icons
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { getCategories, Category as SupabaseCategory } from "@/lib/supabase-queries"; // Import from supabase-queries
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Map of hardcoded icons for categories that might not have a specific icon_name in DB
const defaultIcons: { [key: string]: React.ElementType } = {
  "Lihat semua": LayoutGrid,
  "Semua Promo": Megaphone,
  "Tagihan & Isi Ulang": Receipt,
  "Bliblimart": ShoppingBasket,
  "Sport & Wellness": HeartPulse,
  "Gratis ongkir cepat sampai": Truck,
  "Ibu & Anak": Baby,
  "Otomotif": Car,
  // Add more default icons if needed for specific categories
};

export function CategoryIcons() {
  const [categories, setCategories] = React.useState<SupabaseCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setIsLoading(false);
    }
    fetchCategories();
  }, []);

  // Function to render Lucide icon dynamically
  const renderIcon = (iconName: string | null, fallbackName: string) => {
    if (iconName) {
      const IconComponent = (LucideIcons as any)[iconName];
      if (IconComponent) return <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    }
    // Fallback to defaultIcons map or generic LayoutGrid
    const FallbackIcon = defaultIcons[fallbackName] || LayoutGrid;
    return <FallbackIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card p-3 rounded-lg border">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <CarouselItem key={index} className="pl-2 basis-auto">
                <div className="flex items-center gap-2 p-2 rounded-lg group">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border">
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  return (
    <div className="bg-card p-3 rounded-lg border">
      <Carousel
        opts={{
          align: "start",
          dragFree: true, // Allows for free scrolling like a list
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {categories.map((category, index) => (
            <CarouselItem key={index} className="pl-2 basis-auto">
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border group-hover:border-primary">
                    {renderIcon(category.icon_name, category.name)}
                  </div>
                  {/* You can add a badge logic here if categories have a 'isNew' or 'promo' flag */}
                  {/* {category.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-3 text-[10px] px-1.5 py-0 leading-tight"
                    >
                      {category.badge}
                    </Badge>
                  )} */}
                </div>
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
      </Carousel>
    </div>
  );
}