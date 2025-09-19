"use client";

import * as React from "react";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";
import { cn, formatRupiah } from "@/lib/utils"; // Import formatRupiah
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react"; // Import Star icon
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import Badge

export interface CustomCarouselItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string | null;
  linkUrl: string;
  // New fields to mimic ProductCard
  price: number;
  originalPrice?: number | null;
  rating: number;
  soldCount: string;
  location: string;
}

interface CustomCarouselProps {
  items: CustomCarouselItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  options?: EmblaOptionsType;
  itemClassName?: string; // New prop for custom class on each carousel item
  imageHeightClass?: string; // New prop for custom image height class
}

export function CustomCarousel({
  items,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
  showNavigation = true,
  showPagination = true,
  options,
  itemClassName = "w-full", // Default to full width of its container
  imageHeightClass = "h-48", // Default image height to match ProductCard
}: CustomCarouselProps) {
  const plugins = [];
  if (autoplay) {
    plugins.push(Autoplay({ delay: autoplayDelay, stopOnInteraction: !pauseOnHover }));
  }
  plugins.push(ClassNames());

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop,
      align: "start",
      ...options,
    },
    plugins
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

  if (items.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
          Tidak ada item untuk ditampilkan.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4"> {/* Adjust margin to compensate for item padding */}
          {items.map((item) => {
            const discountPercentage = item.originalPrice
              ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
              : 0;

            return (
              <div key={item.id} className={cn("flex-none pl-4", itemClassName)}>
                <Link href={item.linkUrl} className="block h-full">
                  <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col group h-full">
                    <CardContent className="p-0 flex flex-col flex-grow">
                      <div className="relative">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={200} // Provide a base width, actual size will be controlled by CSS
                            height={200} // Provide a base height, actual size will be controlled by CSS
                            className={cn("w-full object-contain", imageHeightClass)} {/* Changed to object-contain */}
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          />
                        ) : (
                          <div className={cn("w-full bg-muted flex items-center justify-center text-muted-foreground text-sm", imageHeightClass)}>
                            No Image
                          </div>
                        )}
                        <Badge variant="secondary" className="absolute top-2 left-2 text-xs">Bekas</Badge> {/* "Bekas" badge */}
                      </div>
                      <div className="p-4 space-y-2 flex flex-col flex-grow"> {/* Adjusted space-y to match ProductCard */}
                        <h3 className="font-medium text-sm h-10 leading-tight text-foreground line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex-grow" /> {/* Spacer to push price/details to bottom */}
                        <div>
                          <p className="font-bold text-lg text-foreground">
                            {formatRupiah(item.price)}
                          </p>
                          {item.originalPrice && (
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-xs">{discountPercentage}%</Badge>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatRupiah(item.originalPrice)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground pt-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{item.rating}</span>
                            <span className="mx-1">|</span>
                            <span>Terjual {item.soldCount}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {showNavigation && items.length > 1 && (
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