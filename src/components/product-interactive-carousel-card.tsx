"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/supabase/products";
import { formatRupiah } from "@/lib/utils";
import { InteractiveProductCard } from "@/components/ui/interactive-product-card"; // Import the new interactive card

interface ProductInteractiveCarouselCardProps {
  product: Product;
}

export function ProductInteractiveCarouselCard({ product }: ProductInteractiveCarouselCardProps) {
  // Using a generic logo for now, as product data doesn't include brand logo directly
  const genericLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"; 
  const descriptionText = product.description ? product.description.substring(0, 50) + "..." : "Produk berkualitas tinggi dengan harga terbaik.";

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <InteractiveProductCard
        imageUrl={product.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
        logoUrl={genericLogoUrl}
        title={product.name}
        description={descriptionText}
        price={formatRupiah(product.price)}
        className="w-full h-full" // Ensure the card takes full height/width of its container
      />
    </Link>
  );
}