"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CarouselBannerProps {
  images: string[];
  alt: string;
  bannerData?: {
    title: string | null;
    description: string | null;
    link_url: string | null;
  }[];
}

export function CarouselBanner({ images, alt, bannerData }: CarouselBannerProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  // Add this check: If no images, return a fallback or null
  if (images.length === 0) {
    return (
      <div className="w-full h-48 md:h-72 flex items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        Tidak ada banner untuk ditampilkan.
      </div>
    );
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.play}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative w-full h-48 md:h-72 lg:h-96 overflow-hidden rounded-lg">
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                priority={index === 0} // Prioritize the first image for LCP
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw" // Added responsive sizes
              />
              {bannerData && bannerData[index] && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-4 md:p-8">
                  <div className="text-white max-w-md space-y-2">
                    {bannerData[index].title && (
                      <h2 className="text-2xl md:text-4xl font-bold">
                        {bannerData[index].title}
                      </h2>
                    )}
                    {bannerData[index].description && (
                      <p className="text-sm md:text-base hidden md:block">
                        {bannerData[index].description}
                      </p>
                    )}
                    {bannerData[index].link_url && (
                      <Button asChild className="mt-4">
                        <Link href={bannerData[index].link_url!}>Lihat Sekarang</Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}