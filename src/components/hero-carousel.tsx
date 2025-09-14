"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { HeroCarouselSlide } from "@/lib/supabase/hero-carousel-slides";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroCarousel() {
  const [slides, setSlides] = React.useState<HeroCarouselSlide[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSlides = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("hero_carousel_slides")
        .select("*")
        .order("order", { ascending: true });

      if (error) {
        console.error("Error fetching hero carousel slides:", error.message);
      } else {
        setSlides(data || []);
      }
      setIsLoading(false);
    };

    fetchSlides();
  }, []);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[4/1] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="h-full w-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[4/1] rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
        Tidak ada slide carousel untuk ditampilkan.
      </div>
    );
  }

  return (
    <Carousel className="w-full aspect-[16/9] md:aspect-[4/1]">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            {slide.display_style === "split" ? (
              <Link href={slide.link_url || "#"} className="block h-full">
                <div
                  className="relative flex h-full w-full rounded-lg overflow-hidden"
                  style={{ backgroundColor: slide.left_panel_bg_color || "#f0f0f0" }}
                >
                  <div className="flex-1 p-6 flex flex-col justify-center items-start text-left">
                    {slide.is_new && (
                      <Badge variant="secondary" className="mb-2">
                        Baru
                      </Badge>
                    )}
                    {slide.hashtag && (
                      <p className="text-sm text-muted-foreground mb-1">{slide.hashtag}</p>
                    )}
                    {slide.logo_url && (
                      <img src={slide.logo_url} alt="Logo" className="h-8 mb-2" />
                    )}
                    {slide.product_name && (
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {slide.product_name}
                      </h3>
                    )}
                    <div className="flex items-baseline gap-2 mb-4">
                      {slide.discounted_price && (
                        <span className="text-3xl font-bold text-primary">
                          Rp{slide.discounted_price.toLocaleString("id-ID")}
                        </span>
                      )}
                      {slide.original_price && (
                        <span className={`text-lg text-muted-foreground ${slide.discounted_price ? "line-through" : ""}`}>
                          Rp{slide.original_price.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    <Button>Belanja Sekarang</Button>
                  </div>
                  <div className="relative flex-1 h-full">
                    <Image
                      src={slide.product_image_url || "/placeholder-image.jpg"}
                      alt={slide.alt}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              </Link>
            ) : (
              <Link href={slide.link_url || "#"} className="block h-full">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <Image
                    src={slide.product_image_url || "/placeholder-image.jpg"}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}