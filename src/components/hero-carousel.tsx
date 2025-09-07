"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
    alt: "Diskon Elektronik Besar-besaran",
  },
  {
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    alt: "Fashion Sale Akhir Pekan",
  },
  {
    src: "https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?q=80&w=1200&auto=format&fit=crop",
    alt: "Promo Kebutuhan Rumah Tangga",
  },
  {
    src: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200&auto=format&fit=crop",
    alt: "Produk Kecantikan Terbaru",
  },
];

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {carouselImages.map((image, index) => (
          <CarouselItem key={index}>
            <Card className="overflow-hidden rounded-lg">
              <CardContent className="flex aspect-[2.5/1] items-center justify-center p-0">
                <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
    </Carousel>
  );
}