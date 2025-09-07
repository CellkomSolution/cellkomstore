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
    src: "https://placehold.co/1200x480/3b82f6/ffffff?text=Promo+Gila-Gilaan!",
    alt: "Promo 1",
  },
  {
    src: "https://placehold.co/1200x480/10b981/ffffff?text=Gratis+Ongkir",
    alt: "Promo 2",
  },
  {
    src: "https://placehold.co/1200x480/f97316/ffffff?text=Cashback+Spesial",
    alt: "Promo 3",
  },
  {
    src: "https://placehold.co/1200x480/ec4899/ffffff?text=Produk+Terbaru",
    alt: "Promo 4",
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