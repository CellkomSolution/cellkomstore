"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Category {
  name: string;
  icon: string;
  slug: string;
}

const categories: Category[] = [
  { name: "Handphone & Tablet", icon: "/icons/handphone.png", slug: "handphone-tablet" },
  { name: "Komputer & Laptop", icon: "/icons/laptop.png", slug: "komputer-laptop" },
  { name: "Pakaian Pria", icon: "/icons/pakaian-pria.png", slug: "pakaian-pria" },
  { name: "Perhiasan & Logam", icon: "/icons/perhiasan.png", slug: "perhiasan-logam" },
  { name: "Kesehatan & Kecantikan", icon: "/icons/kecantikan.png", slug: "kesehatan-kecantikan" },
  { name: "Olahraga & Outdoor", icon: "/icons/olahraga.png", slug: "olahraga-outdoor" },
  { name: "Rumah Tangga", icon: "/icons/rumah-tangga.png", slug: "rumah-tangga" },
  { name: "Otomotif", icon: "/icons/otomotif.png", slug: "otomotif" },
  { name: "Buku & Alat Tulis", icon: "/icons/buku.png", slug: "buku-alat-tulis" },
  { name: "Mainan & Hobi", icon: "/icons/mainan.png", slug: "mainan-hobi" },
  { name: "Makanan & Minuman", icon: "/icons/makanan.png", slug: "makanan-minuman" },
  { name: "Ibu & Bayi", icon: "/icons/ibu-bayi.png", slug: "ibu-bayi" },
];

export function CategoryIcons() {
  return (
    <div className="bg-gradient-to-br from-background to-card p-3 rounded-lg border">
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 4,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {categories.map((category, index) => (
            <CarouselItem key={index} className="pl-2 basis-1/4 sm:basis-1/6 md:basis-1/8 lg:basis-1/10 xl:basis-[calc(100%/12)]">
              <div className="p-1">
                <Link href={`/category/${category.slug}`} className="flex flex-col items-center text-center group">
                  <Card className="w-full aspect-square flex items-center justify-center p-2 rounded-lg transition-colors group-hover:bg-primary/10">
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="h-10 w-10 md:h-12 md:w-12 object-contain"
                      />
                    </CardContent>
                  </Card>
                  <p className="mt-2 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {category.name}
                  </p>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 -translate-x-1/2" />
        <CarouselNext className="right-0 translate-x-1/2" />
      </Carousel>
    </div>
  );
}