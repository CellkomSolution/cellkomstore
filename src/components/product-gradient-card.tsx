"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/lib/supabase/products";
import { useCart } from "@/context/cart-context";

interface ProductGradientCardProps {
  product: Product;
}

export function ProductGradientCard({ product }: ProductGradientCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <BackgroundGradient className="rounded-[22px] p-4 bg-white dark:bg-zinc-900 h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
        <div className="flex flex-col flex-grow">
          <div className="relative w-full h-56 rounded-lg overflow-hidden mb-4">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                No Image
              </div>
            )}
          </div>
          <div className="flex flex-col flex-grow space-y-1">
            <p className="text-xs text-muted-foreground/80">{product.category}</p>
            <p className="text-xs sm:text-sm text-black dark:text-neutral-200 font-medium line-clamp-2 flex-grow">
              {product.name}
            </p>

            <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
              {Array(5).fill('').map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    product.rating > i ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-1">({product.rating})</span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <p className="text-sm md:text-base font-medium text-primary">
                {formatRupiah(product.price)}
                {product.originalPrice && (
                  <span className="text-muted-foreground/60 text-xs line-through ml-2">
                    {formatRupiah(product.originalPrice)}
                  </span>
                )}
              </p>
              <Button
                className="rounded-full text-xs px-3 py-1.5 bg-black dark:bg-zinc-800 text-white flex items-center space-x-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </BackgroundGradient>
    </Link>
  );
}