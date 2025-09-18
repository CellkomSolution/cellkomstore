"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/lib/supabase/products";
import { useCart } from "@/context/cart-context";
import { CardContent } from "@/components/ui/card"; // Import CardContent for consistent styling

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

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <BackgroundGradient className="rounded-[22px] p-4 bg-white dark:bg-zinc-900 h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 group">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
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
          <div className="flex flex-col flex-grow space-y-2">
            <p className="text-base sm:text-lg text-black dark:text-neutral-200 font-semibold line-clamp-2 flex-grow">
              {product.name}
            </p>

            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-foreground">
                {formatRupiah(product.price)}
              </p>
              {product.originalPrice && (
                <>
                  <Badge variant="destructive" className="text-xs">{discountPercentage}%</Badge>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatRupiah(product.originalPrice)}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{product.rating}</span>
              <span className="mx-1">|</span>
              <span>Terjual {product.soldCount}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{product.location}</p>
            <Button
              className="w-full mt-4 rounded-full text-sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Tambah ke Keranjang
            </Button>
          </div>
        </CardContent>
      </BackgroundGradient>
    </Link>
  );
}