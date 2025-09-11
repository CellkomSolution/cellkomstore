"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { FullCarouselSlide } from "./full-carousel-slide";
import { getHeroCarouselSlides, HeroCarouselSlide as SupabaseHeroCarouselSlide } from "@/lib/supabase-queries";
import { Loader2 } from "lucide-react";

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [carouselSlides, setCarouselSlides] = React.useState<SupabaseHeroCarouselSlide[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSlides() {
      setIsLoading(true);
      const slidesFromSupabase = await getHeroCarouselSlides();
      setCarouselSlides(slidesFromSupabase);
      setIsLoading(false);
    }
    fetchSlides();
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[4/1] rounded-lg overflow-hidden bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (carouselSlides.length === 0) {
    return (
      <div className="relative w-full aspect-[4/1] rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
        Tidak ada slide carousel untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi}
      >
        <CarouselContent>
          {carouselSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden rounded-lg">
                <CardContent className="flex aspect-[4/1] p-0 relative">
                  <FullCarouselSlide
                    productImageSrc={slide.product_image_url || ''}
                    alt={slide.alt}
                    logoSrc={slide.logo_url || undefined}
                    productName={slide.product_name || undefined}
                    originalPrice={slide.original_price || undefined}
                    discountedPrice={slide.discounted_price || undefined}
                    isNew={slide.is_new}
                    hashtag={slide.hashtag || undefined}
                    leftPanelBgColor={slide.left_panel_bg_color || undefined}
                    priority={index === 0}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Custom styled navigation buttons - positioned within the carousel area */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 z-20" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 z-20" />
      </Carousel>
      {/* Carousel Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              index + 1 === current ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}