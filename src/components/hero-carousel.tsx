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
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import Chevron icons

interface FullCarouselBanner {
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

interface ThreePartCarouselSlide {
  type: "three-part"; // Discriminator
  leftPeek: {
    imageSrc: string;
    alt: string;
    bgColor?: string;
  };
  mainBanner: FullCarouselBanner; // Re-use FullCarouselBanner for the main part
  rightPeek: {
    imageSrc?: string;
    logoSrc?: string;
    alt: string;
    bgColor?: string;
    hashtag?: string;
  };
}

type CarouselContentItem = FullCarouselBanner | ThreePartCarouselSlide;

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
    productImageSrc: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=600&auto=format&fit=crop",
    alt: "Diskon Elektronik Besar-besaran",
    productName: "Diskon Elektronik Besar-besaran",
    discountedPrice: 999000,
    hashtag: "#ELEKTRONIKMURAH",
    leftPanelBgColor: "bg-blue-50 dark:bg-blue-900",
  },
  {
    productImageSrc: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
    alt: "Fashion Sale Akhir Pekan",
    productName: "Fashion Sale Akhir Pekan",
    discountedPrice: 250000,
    hashtag: "#FASHIONSALE",
    leftPanelBgColor: "bg-pink-50 dark:bg-pink-900",
  },
  {
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
                    // Render 3-part layout
                    <div className="grid grid-cols-[1fr_4fr_1fr] gap-2 h-full w-full">
                      {/* Left Peek */}
                      <div className={`relative flex items-center justify-center rounded-lg overflow-hidden ${slide.leftPeek.bgColor || 'bg-gray-100 dark:bg-gray-800'}`}>
                        {slide.leftPeek.imageSrc && (
                          <Image src={slide.leftPeek.imageSrc} alt={slide.leftPeek.alt} fill style={{ objectFit: 'cover' }} />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ChevronLeft className="h-8 w-8 text-gray-500 opacity-70" />
                        </div>
                      </div>

                      {/* Main Banner (using FullCarouselBanner structure) */}
                      <div className={`relative flex rounded-lg overflow-hidden ${slide.mainBanner.leftPanelBgColor || 'bg-white dark:bg-gray-900'}`}>
                        {/* Left text panel of main banner */}
                        <div className="w-1/2 flex flex-col justify-center p-3 md:p-6 lg:p-8">
                          {slide.mainBanner.logoSrc && (
                            <Image src={slide.mainBanner.logoSrc} alt="Brand Logo" width={100} height={30} className="h-auto mb-1 md:mb-2" />
                          )}
                          {slide.mainBanner.productName && (
                            <h3 className="text-lg md:text-2xl font-bold leading-tight text-foreground">
                              {slide.mainBanner.productName}
                            </h3>
                          )}
                          {slide.mainBanner.originalPrice && (
                            <p className="text-xs md:text-sm line-through text-muted-foreground mt-0.5">
                              {formatRupiah(slide.mainBanner.originalPrice)}
                            </p>
                          )}
                          {slide.mainBanner.discountedPrice && (
                            <p className="text-xl md:text-3xl font-extrabold text-primary mt-0.5">
                              {formatRupiah(slide.mainBanner.discountedPrice)}
                            </p>
                          )}
                          {slide.mainBanner.hashtag && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {slide.mainBanner.hashtag}
                            </p>
                          )}
                        </div>
                        {/* Right image panel of main banner */}
                        <div className="w-1/2 relative flex items-center justify-end">
                          <Image src={slide.mainBanner.productImageSrc} alt={slide.mainBanner.alt} width={600} height={480} className="h-full w-auto object-contain object-right" priority={index === 0} />
                          {slide.mainBanner.isNew && (
                            <Badge variant="destructive" className="absolute top-4 right-4 rotate-12 text-xs px-2 py-0.5">NEW</Badge>
                          )}
                        </div>
                      </div>

                      {/* Right Peek */}
                      <div className={`relative flex items-center justify-center rounded-lg overflow-hidden ${slide.rightPeek.bgColor || 'bg-gray-100 dark:bg-gray-800'}`}>
                        {slide.rightPeek.logoSrc && (
                          <Image src={slide.rightPeek.logoSrc} alt={slide.rightPeek.alt} width={80} height={24} className="h-auto w-auto max-w-[80%] max-h-[80%]" />
                        )}
                        {slide.rightPeek.imageSrc && (
                          <Image src={slide.rightPeek.imageSrc} alt={slide.rightPeek.alt} fill style={{ objectFit: 'cover' }} />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ChevronRight className="h-8 w-8 text-gray-500 opacity-70" />
                        </div>
                        {slide.rightPeek.hashtag && (
                          <p className="absolute bottom-2 text-xs text-muted-foreground">
                            {slide.rightPeek.hashtag}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Render existing full banner layout
                    <div className={`relative w-full flex rounded-lg overflow-hidden ${slide.leftPanelBgColor || 'bg-white dark:bg-gray-900'}`}>
                      {/* Left text panel */}
                      <div className="w-2/3 md:w-1/2 flex flex-col justify-center p-3 md:p-6 lg:p-8 z-10 rounded-l-lg">
                        {slide.logoSrc && (
                          <Image src={slide.logoSrc} alt="Brand Logo" width={100} height={30} className="h-auto mb-1 md:mb-2" />
                        )}
                        {slide.productName && (
                          <h3 className="text-lg md:text-2xl font-bold leading-tight text-foreground">
                            {slide.productName}
                          </h3>
                        )}
                        {slide.originalPrice && (
                          <p className="text-xs md:text-sm line-through text-muted-foreground mt-0.5">
                            {formatRupiah(slide.originalPrice)}
                          </p>
                        )}
                        {slide.discountedPrice && (
                          <p className="text-xl md:text-3xl font-extrabold text-primary mt-0.5">
                            {formatRupiah(slide.discountedPrice)}
                          </p>
                        )}
                        {slide.hashtag && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {slide.hashtag}
                          </p>
                        )}
                      </div>
                      {/* Right image panel */}
                      <div className="relative w-1/3 md:w-1/2 flex items-center justify-end rounded-r-lg bg-white dark:bg-gray-900">
                        <Image src={slide.productImageSrc} alt={slide.alt} width={600} height={480} className="h-full w-auto object-contain object-right" priority={index === 0} />
                        {slide.isNew && (
                          <Badge variant="destructive" className="absolute top-4 right-4 rotate-12 text-xs px-2 py-0.5">NEW</Badge>
                        )}
                      </div>
                    </div>
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