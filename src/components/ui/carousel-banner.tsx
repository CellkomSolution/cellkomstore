"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ClassNames from "embla-carousel-class-names";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CarouselBannerProps {
  images: string[];
  bannerData: {
    title: string | null;
    description: string | null;
    link_url: string | null;
  }[];
  alt?: string;
  className?: string;
}

export const CarouselBanner = ({
  images,
  bannerData,
  alt = "Carousel Banner",
  className,
}: CarouselBannerProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000, stopOnInteraction: false }), ClassNames()]
  );

  const scrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, setScrollSnaps, onSelect]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg text-muted-foreground">
        Tidak ada banner untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex">
          {images.map((image, index) => {
            const data = bannerData[index];
            return (
              <div key={index} className="embla__slide relative flex-none w-full aspect-video">
                <Image
                  src={image}
                  alt={data?.title || alt}
                  fill
                  priority={index === 0} // Prioritize first image for LCP
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw"
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
                {data && (data.title || data.description || data.link_url) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:p-8 flex flex-col justify-end text-white rounded-lg">
                    {data.title && (
                      <h3 className="text-xl md:text-3xl font-bold mb-2 line-clamp-2">
                        {data.title}
                      </h3>
                    )}
                    {data.description && (
                      <p className="text-sm md:text-base mb-4 line-clamp-2">
                        {data.description}
                      </p>
                    )}
                    {data.link_url && (
                      <Link href={data.link_url} passHref>
                        <Button className="w-fit">Lihat Detail</Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70 rounded-full h-8 w-8 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70 rounded-full h-8 w-8 md:h-10 md:w-10"
          >
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            <span className="sr-only">Next slide</span>
          </Button>
        </>
      )}

      {/* Dots Pagination */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full bg-white/50 transition-all",
                index === selectedIndex ? "w-6 bg-white" : ""
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};