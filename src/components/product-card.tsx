"use client";

import { Star, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "./ui/button";
import { useCart } from "@/context/cart-context";
import Image from "next/image"; // Import Image component
import { formatRupiah } from "@/lib/utils"; // Import formatRupiah

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col group">
      <Link href={`/product/${product.id}`} className="block flex flex-col flex-grow">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={160} // Lebar default, sesuaikan jika perlu
              height={192} // Tinggi default (h-48), sesuaikan jika perlu
              className="w-full h-48 object-cover"
              priority // Tambahkan priority jika gambar ini penting untuk LCP
            />
             <Button 
                size="sm" 
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleAddToCart}
            >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add
            </Button>
          </div>
          <div className="p-4 space-y-2 flex flex-col flex-grow">
            <h3 className="font-medium text-sm h-10 leading-tight text-foreground line-clamp-2">
              {product.name}
            </h3>
            <div className="flex-grow" />
            <div>
                <p className="font-bold text-lg text-foreground">
                {formatRupiah(product.price)}
                </p>
                {product.originalPrice && (
                <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">{discountPercentage}%</Badge>
                    <span className="text-xs text-muted-foreground line-through">
                    {formatRupiah(product.originalPrice)}
                    </span>
                </div>
                )}
                <div className="flex items-center text-xs text-muted-foreground pt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{product.rating}</span>
                <span className="mx-1">|</span>
                <span>Terjual {product.soldCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">{product.location}</p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}