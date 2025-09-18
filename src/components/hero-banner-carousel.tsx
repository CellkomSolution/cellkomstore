"use client";

import * as React from "react";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";
import { cn } from "@/lib/utils";
import { HeroBanner, getHeroBanners } from "@/lib/supabase/hero-banners";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroBannerCarouselProps {
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
  options?: EmblaOptionsType;
}

export function HeroBannerCarousel({
  autoplayDelay = 5000,
  showPagination = true,
  showNavigation = true,
  options,
}: HeroBannerCarouselProps) {
  const [banners, setBanners] = React.useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBanners() {
      setIsLoading(true);
      const fetchedBanners = await getHeroBanners(true); // Only active banners
      setBanners(fetchedBanners);
      setIsLoading(false);
    }
    fetchBanners();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      ...options,
    },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false }), ClassNames()]
  );

  const scrollPrev = React.useCallback(() => {
    emblaApi && emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    emblaApi && emblaApi.scrollNext();
  }, [emblaApi]);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  const onInit = React.useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[2/1] md:aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full aspect-[2/1] md:aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
        Tidak ada banner untuk ditampilkan.
      </div>
    );
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-md">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => (
            <div key={banner.id} className="flex-none w-full relative aspect-[2/1] md:aspect-video">
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                style={{ objectFit: "cover" }}
                priority={index === 0} // Prioritize first image for LCP
                sizes="(max-width: 768px) 100vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-4 md:p-12">
                <motion.div
                  initial="hidden"
                  animate={index === selectedIndex ? "visible" : "hidden"}
                  variants={textVariants}
                  key={selectedIndex} // Reset animation on slide change
                  className="max-w-md text-white space-y-1 md:space-y-3"
                >
                  <h2 className="text-xl md:text-4xl font-bold leading-tight">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="text-xs md:text-base">
                      {banner.description}
                    </p>
                  )}
                  {banner.button_text && banner.button_link && (
                    <Button asChild size="xs" className="mt-2 md:mt-4 md:text-base md:px-6 md:py-3">
                      <Link href={banner.button_link}>
                        {banner.button_text}
                      </Link>
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNavigation && banners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/50 hover:bg-background/70 hidden md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/50 hover:bg-background/70 hidden md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {showPagination && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center space-x-2 z-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full bg-white/50",
                index === selectedIndex && "bg-white"
              )}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}