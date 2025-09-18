"use client";

import * as React from "react";
import { AnimatedCard } from "@/components/ui/feature-block-animated-card";
import { Smartphone, Laptop, Watch, Headphones, Camera, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CategoryFeatureBlock() {
  // Menggunakan ikon Lucide sebagai representasi kategori
  const categoryIcons = [
    { icon: <Smartphone className="h-8 w-8 text-primary" />, size: "lg" as const },
    { icon: <Laptop className="h-6 w-6 text-primary" />, size: "md" as const },
    { icon: <Watch className="h-4 w-4 text-primary" />, size: "sm" as const },
    { icon: <Headphones className="h-6 w-6 text-primary" />, size: "md" as const },
    { icon: <Camera className="h-8 w-8 text-primary" />, size: "lg" as const },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <AnimatedCard
        title="Jelajahi Kategori Produk Kami"
        description="Temukan berbagai pilihan gadget, elektronik, dan aksesori terbaru yang sesuai dengan kebutuhan Anda."
        icons={categoryIcons}
        className="max-w-lg" // Sesuaikan ukuran card jika perlu
      />
      <Button asChild className="mt-6">
        <Link href="/categories">Lihat Semua Kategori</Link>
      </Button>
    </div>
  );
}