"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

interface ThreePartCarouselSlideProps {
  leftPeek: {
    imageSrc?: string;
    alt: string;
    bgColor?: string;
  };
  mainBanner: {
    productImageSrc: string;
    alt: string;
    logoSrc?: string;
    productName?: string;
    originalPrice?: number;
    discountedPrice?: number;
    isNew?: boolean;
    hashtag?: string;
    leftPanelBgColor?: string;
  };
  rightPeek: {
    imageSrc?: string;
    logoSrc?: string;
    alt: string;
    bgColor?: string;
    hashtag?: string;
  };
  priority?: boolean;
}

export function ThreePartCarouselSlide({
  leftPeek,
  mainBanner,
  rightPeek,
  priority = false,
}: ThreePartCarouselSlideProps) {
  return (
    <div className="grid grid-cols-[1fr_4fr_1fr] gap-2 h-full w-full">
      {/* Left Peek */}
      <div className={`relative flex items-center justify-center rounded-lg overflow-hidden ${leftPeek.bgColor || 'bg-gray-100 dark:bg-gray-800'}`}>
        {leftPeek.imageSrc && (
          <Image src={leftPeek.imageSrc} alt={leftPeek.alt} fill style={{ objectFit: 'cover' }} />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <ChevronLeft className="h-8 w-8 text-gray-500 opacity-70" />
        </div>
      </div>

      {/* Main Banner */}
      <div className={`relative flex rounded-lg overflow-hidden ${mainBanner.leftPanelBgColor || 'bg-white dark:bg-gray-900'}`}>
        {/* Left text panel of main banner */}
        <div className="w-1/2 flex flex-col justify-center p-3 md:p-6 lg:p-8">
          {mainBanner.logoSrc && (
            <Image src={mainBanner.logoSrc} alt="Brand Logo" width={100} height={30} className="h-auto mb-1 md:mb-2" />
          )}
          {mainBanner.productName && (
            <h3 className="text-lg md:text-2xl font-bold leading-tight text-foreground">
              {mainBanner.productName}
            </h3>
          )}
          {mainBanner.originalPrice && (
            <p className="text-xs md:text-sm line-through text-muted-foreground mt-0.5">
              {formatRupiah(mainBanner.originalPrice)}
            </p>
          )}
          {mainBanner.discountedPrice && (
            <p className="text-xl md:text-3xl font-extrabold text-primary mt-0.5">
              {formatRupiah(mainBanner.discountedPrice)}
            </p>
          )}
          {mainBanner.hashtag && (
            <p className="text-xs text-muted-foreground mt-1">
              {mainBanner.hashtag}
            </p>
          )}
        </div>
        {/* Right image panel of main banner */}
        <div className="w-1/2 relative flex items-center justify-end">
          <Image src={mainBanner.productImageSrc} alt={mainBanner.alt} width={600} height={480} className="h-full w-auto object-contain object-right" priority={priority} />
          {mainBanner.isNew && (
            <Badge variant="destructive" className="absolute top-4 right-4 rotate-12 text-xs px-2 py-0.5">NEW</Badge>
          )}
        </div>
      </div>

      {/* Right Peek */}
      <div className={`relative flex items-center justify-center rounded-lg overflow-hidden ${rightPeek.bgColor || 'bg-gray-100 dark:bg-gray-800'}`}>
        {rightPeek.logoSrc && (
          <Image src={rightPeek.logoSrc} alt={rightPeek.alt} width={80} height={24} className="h-auto w-auto max-w-[80%] max-h-[80%]" />
        )}
        {rightPeek.imageSrc && (
          <Image src={rightPeek.imageSrc} alt={rightPeek.alt} fill style={{ objectFit: 'cover' }} />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <ChevronRight className="h-8 w-8 text-gray-500 opacity-70" />
        </div>
        {rightPeek.hashtag && (
          <p className="absolute bottom-2 text-xs text-muted-foreground">
            {rightPeek.hashtag}
          </p>
        )}
      </div>
    </div>
  );
}