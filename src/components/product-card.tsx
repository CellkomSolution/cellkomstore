"use client";

import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/supabase/products";
import Link from "next/link";
import { Button } from "./ui/button";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import * as React from "react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isAddedToCart, setIsAddedToCart] = React.useState(false);

  const images = product.images.length > 0 ? product.images.map(img => img.image_url) : (product.imageUrl ? [product.imageUrl] : []);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddedToCart) return;
    setIsAddingToCart(true);
    addItem(product); // Add to cart immediately
    setTimeout(() => {
      setIsAddingToCart(false);
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000); // Reset "Added to Cart" state after 2 seconds
    }, 800); // Simulate network delay
  };

  const handleWishlistToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Placeholder for isNew and isBestSeller, can be replaced with actual logic
  const isNew = Math.random() > 0.7; // Example: 30% chance to be new
  const isBestSeller = Math.random() > 0.8; // Example: 20% chance to be best seller
  const freeShipping = Math.random() > 0.5; // Example: 50% chance for free shipping

  return (
    <Card className="w-full overflow-hidden group bg-background text-foreground shadow-xl hover:shadow-lg transition-all duration-300 rounded-md h-full flex flex-col">
      <Link href={`/product/${product.id}`} className="block flex flex-col flex-grow">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative aspect-[3/4] overflow-hidden">
            {images.length > 0 ? (
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${product.name} - View ${currentImageIndex + 1}`}
                className="object-cover w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                No Image
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-primary w-4" : "bg-primary/30"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isNew && (
                <Badge className="bg-blue-500 hover:bg-blue-500/90">New</Badge>
              )}
              {isBestSeller && (
                <Badge className="bg-amber-500 hover:bg-amber-500/90">
                  Best Seller
                </Badge>
              )}
              {product.isFlashSale && discountPercentage > 0 && (
                <Badge className="bg-rose-500 hover:bg-rose-500/90">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            <Button
              variant="secondary"
              size="icon"
              className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm ${
                isWishlisted ? "text-rose-500" : ""
              }`}
              onClick={handleWishlistToggle}
            >
              <Heart
                className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`}
              />
            </Button>
          </div>

          <div className="p-4 space-y-3 flex flex-col flex-grow">
            <div>
              <h3 className="font-medium line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span className="ml-1 text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.soldCount} terjual)
                </span>
                {freeShipping && (
                  <span className="text-xs text-emerald-600 ml-auto">
                    Gratis Ongkir
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{formatRupiah(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="flex-grow" /> {/* Pushes content to top */}
          </div>
        </CardContent>
      </Link>
      <div className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAddingToCart || isAddedToCart}
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menambahkan...
            </>
          ) : isAddedToCart ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Ditambahkan!
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Tambah ke Keranjang
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}