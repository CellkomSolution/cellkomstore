"use client";

import { CarouselBanner } from "@/components/ui/carousel-banner"; // Updated import path and component name

export function HeroCarousel() {
    const bannerImages: string[] = [
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1674&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1740&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1740&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1742&auto=format&fit=crop",
    ];

    return (
        <div className="w-full font-sans">
            <CarouselBanner images={bannerImages} alt="Hero Banner" />
        </div>
    );
}