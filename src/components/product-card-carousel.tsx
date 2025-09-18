"use client";

import * as React from "react";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/supabase/products";
import { ProductGradientCard } from "./product-gradient-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardCarouselProps {
  products: Product[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
  options?: EmblaOptionsType;
}

export function ProductCardCarousel({
  products,
  autoplayDelay = 3000,
  showPagination = true,
  showNavigation = true,
  options,
}: ProductCardCarouselProps) {
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

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4"> {/* Adjust margin to compensate for item padding */}
          {products.map((product) => (
            <div key={product.id} className="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 pl-4"> {/* Responsive width */}
              <ProductGradientCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {showNavigation && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex"
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