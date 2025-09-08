"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

const brands = [
  { name: "Kurumi", logoSrc: "/kurumi-logo.png", slug: "kurumi" },
  { name: "Redigo", logoSrc: "/redigo-logo.png", slug: "redigo" },
  { name: "Premier League", logoSrc: "/premier-league-logo.png", slug: "premier-league" },
  { name: "Samsung", logoSrc: null, slug: "samsung" },
  { name: "Apple", logoSrc: null, slug: "apple" },
  { name: "Xiaomi", logoSrc: null, slug: "xiaomi" },
];

export function FeaturedBrands() {
  return (
    <section className="bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Brand Pilihan</h2>
        <Link href="/brands" className="text-sm font-semibold text-primary hover:underline flex items-center">
          Lihat Semua <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Link href={`/brand/${brand.slug}`} key={brand.name}>
            <Card className="p-4 flex items-center justify-center aspect-square hover:shadow-md transition-shadow">
              {brand.logoSrc ? (
                <div className="relative w-full h-full">
                  <Image
                    src={brand.logoSrc}
                    alt={`${brand.name} logo`}
                    fill
                    style={{ objectFit: "contain" }}
                    className="p-2"
                  />
                </div>
              ) : (
                <span className="font-bold text-muted-foreground">{brand.name}</span>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}