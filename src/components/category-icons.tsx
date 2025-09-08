"use client";

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
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

const categories = [
  { name: "Lihat semua", icon: LayoutGrid, slug: "/", badge: "Baru" },
  { name: "Semua Promo", icon: Megaphone, slug: "/promo" },
  { name: "Tagihan & Isi Ulang", icon: Receipt, slug: "/bills" },
  { name: "Bliblimart", icon: ShoppingBasket, slug: "/bliblimart" },
  { name: "Gadget & Elektronik", icon: Smartphone, slug: "/gadgets" },
  { name: "Sport & Wellness", icon: HeartPulse, slug: "/sports" },
  { name: "Gratis ongkir cepat sampai", icon: Truck, slug: "/shipping-promo", badge: "Baru" },
  { name: "Pakaian Pria", icon: Shirt, slug: "pakaian-pria" },
  { name: "Perhiasan & Logam", icon: Gem, slug: "perhiasan-logam" },
  { name: "Ibu & Anak", icon: Baby, slug: "ibu-anak" },
  { name: "Otomotif", icon: Car, slug: "otomotif" },
];

export function CategoryIcons() {
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
                href={category.slug}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border group-hover:border-primary">
                    <category.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  {category.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-3 text-[10px] px-1.5 py-0 leading-tight"
                    >
                      {category.badge}
                    </Badge>
                  )}
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