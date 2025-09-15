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
import { getHeroCarouselSlides, HeroCarouselSlide } from "@/lib/supabase/hero-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

export function HeroCarousel() {
  const [slides, setSlides] = React.useState<HeroCarouselSlide[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSlides = async () => {
      setIsLoading(true);
      try {
        const data = await getHeroCarouselSlides();
        console.log("Fetched hero carousel slides:", data);
        console.log("Number of slides fetched:", data.length); // Log jumlah slide
        setSlides(data || []);
      } catch (error) {
        console.error("Error fetching hero carousel slides:", error);
        setSlides([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[16/9] md:h-[350px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="h-full w-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (slides.length === 0) {
    console.log("No hero carousel slides to display. Current slides array is empty."); // Log jika array kosong
    return (
      <div className="relative w-full aspect-[16/9] md:h-[350px] rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
        Tidak ada slide carousel untuk ditampilkan.
      </div>
    );
  }

  return (
    <Carousel className="w-full aspect-[16/9] md:h-[350px]">
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
                      <div className="relative h-8 w-20 mb-2"> {/* Wrapper for Image component */}
                        <Image src={slide.logo_url} alt="Logo" fill style={{ objectFit: "contain" }} sizes="80px" />
                      </div>
                    )}
                    {slide.product_name && (
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {slide.product_name}
                      </h3>
                    )}
                    <div className="flex items-baseline gap-2 mb-4">
                      {slide.discounted_price && (
                        <span className="text-3xl font-bold text-primary">
                          {formatRupiah(slide.discounted_price)}
                        </span>
                      )}
                      {slide.original_price && (
                        <span className={`text-lg text-muted-foreground ${slide.discounted_price ? "line-through" : ""}`}>
                          {formatRupiah(slide.original_price)}
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
                      sizes="(max-width: 768px) 50vw, 50vw"
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
                    sizes="(max-width: 768px) 100vw, 100vw"
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