"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

interface FullCarouselBannerProps {
  productImageSrc: string;
  alt: string;
  logoSrc?: string;
  productName?: string;
  originalPrice?: number;
  discountedPrice?: number;
  isNew?: boolean;
  hashtag?: string;
  leftPanelBgColor?: string;
  priority?: boolean;
}

export function FullCarouselSlide({
  productImageSrc,
  alt,
  logoSrc,
  productName,
  originalPrice,
  discountedPrice,
  isNew,
  hashtag,
  leftPanelBgColor,
  priority = false,
}: FullCarouselBannerProps) {
  return (
    <div className={`relative w-full flex rounded-lg overflow-hidden ${leftPanelBgColor || 'bg-white dark:bg-gray-900'}`}>
      {/* Left text panel */}
      <div className="w-2/3 md:w-1/2 flex flex-col justify-center p-3 md:p-6 lg:p-8 z-10 rounded-l-lg">
        {logoSrc && (
          <Image src={logoSrc} alt="Brand Logo" width={100} height={30} className="h-auto mb-1 md:mb-2" />
        )}
        {productName && (
          <h3 className="text-lg md:text-2xl font-bold leading-tight text-foreground">
            {productName}
          </h3>
        )}
        {originalPrice && (
          <p className="text-xs md:text-sm line-through text-muted-foreground mt-0.5">
            {formatRupiah(originalPrice)}
          </p>
        )}
        {discountedPrice && (
          <p className="text-xl md:text-3xl font-extrabold text-primary mt-0.5">
            {formatRupiah(discountedPrice)}
          </p>
        )}
        {hashtag && (
          <p className="text-xs text-muted-foreground mt-1">
            {hashtag}
          </p>
        )}
      </div>
      {/* Right image panel */}
      <div className="relative w-1/3 md:w-1/2 flex items-center justify-end rounded-r-lg bg-white dark:bg-gray-900">
        <Image src={productImageSrc} alt={alt} width={600} height={480} className="h-full w-auto object-contain object-right" priority={priority} />
        {isNew && (
          <Badge variant="destructive" className="absolute top-4 right-4 rotate-12 text-xs px-2 py-0.5">NEW</Badge>
        )}
      </div>
    </div>
  );
}