"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
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
import { toast } from "sonner"; // Import toast

export function HeroCarousel() {
  const [slides, setSlides] = React.useState<HeroCarouselSlide[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter(); // Inisialisasi useRouter

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
      <div className="relative w-full aspect-[16/9] md:h-[300px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="h-full w-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (slides.length === 0) {
    console.log("No hero carousel slides to display. Current slides array is empty."); // Log jika array kosong
    return (
      <div className="relative w-full aspect-[16/9] md:h-[300px] rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
        Tidak ada slide carousel untuk ditampilkan.
      </div>
    );
  }

  return (
    <Carousel className="w-full aspect-[16/9] md:h-[300px] rounded-lg overflow-hidden">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            {slide.display_style === "split" ? (
              <Link href={slide.link_url || "#"} className="block h-full">
                <div
                  className="relative flex h-full w-full"
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
                    {slide.logo_url ? (
                      <div className="relative h-8 w-20 mb-2"> {/* Wrapper for Image component */}
                        <Image src={slide.logo_url} alt="Logo" fill style={{ objectFit: "contain" }} sizes="80px" />
                      </div>
                    ) : (
                      <div className="h-8 w-20 mb-2 flex items-center justify-center text-muted-foreground text-xs">
                        No Logo
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
                      sizes="(max-width: 768px) 50vw, 50vw"
                    />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative w-full h-full rounded-lg overflow-hidden"> {/* Changed from Link to div */}
                <Image
                  src={slide.product_image_url || "/placeholder-image.jpg"}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
                {/* Overlay content for full display style */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-start justify-center p-6 md:p-12 text-white">
                  {slide.alt && ( // Using alt for the main title
                    <h3 className="text-2xl md:text-4xl font-bold mb-2">
                      {slide.alt}
                    </h3>
                  )}
                  {slide.hashtag && ( // Using hashtag for the description
                    <p className="text-base md:text-lg mb-4 max-w-md">
                      {slide.hashtag}
                    </p>
                  )}
                  {slide.link_url && (
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-6 py-3 h-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        if (slide.link_url) {
                          router.push(slide.link_url);
                        } else {
                          console.warn("Attempted to navigate with null link_url for slide:", slide);
                          toast.error("Tautan tidak tersedia.");
                        }
                      }}
                    >
                      LAYANAN SERVIS
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}