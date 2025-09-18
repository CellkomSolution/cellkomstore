"use client";

import * as React from "react";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "./hero-banner";
import { getHeroBanners, HeroBanner as HeroBannerType } from "@/lib/supabase/hero-banners";
import { Card, CardContent } from "@/components/ui/card";

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
  const [banners, setBanners] = React.useState<HeroBannerType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBanners() {
      setIsLoading(true);
      const fetchedBanners = await getHeroBanners(true); // Fetch only active banners
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
      <Card className="relative w-full h-[250px] md:h-[350px] lg:h-[450px] rounded-lg overflow-hidden flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (banners.length === 0) {
    return (
      <Card className="relative w-full h-[250px] md:h-[350px] lg:h-[450px] rounded-lg overflow-hidden flex items-center justify-center bg-muted">
        <CardContent className="text-center text-muted-foreground">
          Tidak ada banner hero untuk ditampilkan.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-none w-full">
              {banner.image_url && (
                <HeroBanner
                  imageUrl={banner.image_url}
                  title={banner.title}
                  description={banner.description}
                  linkText={banner.link_text}
                  linkUrl={banner.link_url}
                />
              )}
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {showPagination && scrollSnaps.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700",
                index === selectedIndex && "bg-primary dark:bg-primary-foreground"
              )}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}