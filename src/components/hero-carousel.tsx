"use client";

import { CarouselBanner } from "@/components/ui/carousel-banner";
import { useState, useEffect } from "react";
import { getCarouselBanners, CarouselBanner as CarouselBannerType } from "@/lib/supabase/carousel-banners"; // Import type and function
import { Skeleton } from "@/components/ui/skeleton";

export function HeroCarousel() {
    const [banners, setBanners] = useState<CarouselBannerType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchBanners() {
            setIsLoading(true);
            const fetchedBanners = await getCarouselBanners();
            setBanners(fetchedBanners);
            setIsLoading(false);
        }
        fetchBanners();
    }, []);

    if (isLoading) {
        return <Skeleton className="w-full h-48 md:h-72 rounded-lg" />;
    }

    // Extract image_urls, titles, descriptions, and link_urls for the CarouselBanner component
    const images = banners.map(banner => banner.image_url);
    const bannerData = banners.map(banner => ({
        title: banner.title,
        description: banner.description,
        link_url: banner.link_url,
    }));

    return (
        <div className="w-full font-sans">
            <CarouselBanner images={images} alt="Hero Banner" bannerData={bannerData} />
        </div>
    );
}