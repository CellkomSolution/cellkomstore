"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Skeleton */}
        <div>
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" /> {/* Product Name */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-1/4" /> {/* Rating */}
            <Skeleton className="h-4 w-1/4" /> {/* Sold Count */}
          </div>
          <Skeleton className="h-10 w-1/2" /> {/* Price */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" /> {/* Discount Badge */}
            <Skeleton className="h-4 w-1/4" /> {/* Original Price */}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Skeleton className="h-12 w-full sm:w-1/2" /> {/* Add to Cart Button */}
            <Skeleton className="h-12 w-full sm:w-1/2" /> {/* Buy Now Button */}
          </div>
          <div className="border-t pt-6 space-y-4">
            <Skeleton className="h-5 w-2/3" /> {/* Seller Info */}
            <Skeleton className="h-5 w-2/3" /> {/* Shipping Info */}
            <Skeleton className="h-5 w-2/3" /> {/* Guarantee Info */}
          </div>
        </div>
      </div>

      {/* Product Description Skeleton */}
      <div className="mt-12">
        <Skeleton className="h-6 w-1/3 mb-4" /> {/* Description Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}