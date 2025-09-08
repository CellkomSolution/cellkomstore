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
import { ThreePartCarouselSlide } from "./three-part-carousel-slide";

interface FullCarouselBanner {
  type?: "full-banner";
  productImageSrc: string;
  alt: string;
  logoSrc?: string;
  productName?: string;
  originalPrice?: number;
  discountedPrice?: number;
  isNew?: boolean;
  hashtag?: string;
  leftPanelBgColor?: string;
}

interface ThreePartCarouselSlideData {
  type: "three-part";
  leftPeek: {
    imageSrc?: string;
    alt: string;
    bgColor?: string;
  };
  mainBanner: FullCarouselBanner;
  rightPeek: {
    imageSrc?: string;
    logoSrc?: string;
    alt: string;
    bgColor?: string;
    hashtag?: string;
  };
}

type CarouselContentItem = FullCarouselBanner | ThreePartCarouselSlideData;

const carouselSlides: CarouselContentItem[] = [
  {
    type: "three-part",
    leftPeek: {
      imageSrc: "https://images.unsplash.com/photo-1610945265064-0039e680ba21?q=80&w=600&auto=format&fit=crop", // Green phone
      alt: "Green Phone",
      bgColor: "bg-gray-100 dark:bg-gray-800",
    },
    mainBanner: {
      productImageSrc: "https://images.unsplash.com/photo-1621609764095-f5285a59195f?q=80&w=600&auto=format&fit=crop", // Charger image
      alt: "Redigo Cas Dua Perangkat Super Cepat",
      logoSrc: "/redigo-logo.png",
      productName: "Cas Dua Perangkat Super Cepat",
      discountedPrice: 189000,
      hashtag: "#NOBLABLADIBLIBLI",
      leftPanelBgColor: "bg-blue-100 dark:bg-blue-950",
    },
    rightPeek: {
      logoSrc: "/premier-league-logo.png",
      alt: "Premier League",
      bgColor: "bg-purple-200 dark:bg-purple-950",
      hashtag: "#NOBLABLAD", // From image
    },
  },
  {
    type: "full-banner", // Explicitly set type
    productImageSrc: "https://plus.unsplash.com/premium_photo-1661764878654-f2ff0e1d265a?q=80&w=600&auto=format&fit=crop", // Example product image (vacuum cleaner)
    alt: "KV 01 Turbo DOUBLE BRUSH",
    logoSrc: "/kurumi-logo.png",
    productName: "KV 01 Turbo DOUBLE BRUSH",
    originalPrice: 1750000,
    discountedPrice: 1399000,
    isNew: true,
    hashtag: "#NOBLABLADIBLIBLI",
    leftPanelBgColor: "bg-gray-50 dark:bg-gray-800",
  },
  {
    type: "full-banner", // Explicitly set type
    productImageSrc: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=600&auto=format&fit=crop",
    alt: "Diskon Elektronik Besar-besaran",
    productName: "Diskon Elektronik Besar-besaran",
    discountedPrice: 999000,
    hashtag: "#ELEKTRONIKMURAH",
    leftPanelBgColor: "bg-blue-50 dark:bg-blue-900",
  },
  {
    type: "full-banner", // Explicitly set type
    productImageSrc: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
    alt: "Fashion Sale Akhir Pekan",
    productName: "Fashion Sale Akhir Pekan",
    discountedPrice: 250000,
    hashtag: "#FASHIONSALE",
    leftPanelBgColor: "bg-pink-50 dark:bg-pink-900",
  },
  {
    type: "full-banner", // Explicitly set type
    productImageSrc: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop",
    alt: "Produk Kecantikan Terbaru",
    productName: "Produk Kecantikan Terbaru",
    discountedPrice: 150000,
    hashtag: "#KECANTIKAN",
    leftPanelBgColor: "bg-purple-50 dark:bg-purple-900",
  },
];

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

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
                  {slide.type === "three-part" ? (
                    <ThreePartCarouselSlide
                      leftPeek={slide.leftPeek}
                      mainBanner={slide.mainBanner}
                      rightPeek={slide.rightPeek}
                      priority={index === 0}
                    />
                  ) : (
                    <FullCarouselSlide
                      productImageSrc={slide.productImageSrc}
                      alt={slide.alt}
                      logoSrc={slide.logoSrc}
                      productName={slide.productName}
                      originalPrice={slide.originalPrice}
                      discountedPrice={slide.discountedPrice}
                      isNew={slide.isNew}
                      hashtag={slide.hashtag}
                      leftPanelBgColor={slide.leftPanelBgColor}
                      priority={index === 0}
                    />
                  )}
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