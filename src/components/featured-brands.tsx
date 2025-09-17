"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeaturedBrands, FeaturedBrand } from "@/lib/supabase/featured-brands";
import Image from "next/image";
import { CardCarousel } from "@/components/ui/card-carousel"; // Import CardCarousel

export const FeaturedBrands = () => {
  const [brands, setBrands] = useState<FeaturedBrand[]>([]);
  const [title, setTitle] = useState<string>("Brand Pilihan");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeaturedBrandsAndTitle = async () => {
      setLoading(true);
      const brandsData = await getFeaturedBrands();
      setBrands(brandsData);

      const { data: settingsData, error: settingsError } = await supabase
        .from("app_settings")
        .select("featured_brands_title")
        .single();

      if (settingsError) {
        console.error("Error fetching featured brands title:", settingsError.message);
      } else {
        setTitle(settingsData?.featured_brands_title || "Brand Pilihan");
      }
      setLoading(false);
    };

    fetchFeaturedBrandsAndTitle();
  }, []);

  const carouselImages = brands
    .filter(brand => brand.image_url) // Only include brands with an image
    .map(brand => ({
      src: brand.image_url!, // Non-null assertion as we filtered
      alt: `Brand ${brand.id}`, // Generic alt text, could be improved with brand name if available
      link: brand.link_url || "#", // Add link for navigation
    }));

  return (
    <section className="bg-gray-900 p-4 rounded-lg border border-gray-800"> {/* Changed background and added border */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2> {/* Changed text color to white */}
        <Link href="/brands" className="text-sm font-semibold text-blue-400 hover:underline flex items-center"> {/* Changed text color to blue-400 */}
          Lihat Semua
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-4 h-4 ml-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-24 rounded-lg" />
          ))}
        </div>
      ) : carouselImages.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground">Belum ada merek unggulan untuk ditampilkan.</p>
      ) : (
        <CardCarousel
          images={carouselImages}
          autoplayDelay={2500} // Adjust delay as needed
          showPagination={false} // Hide pagination for a cleaner look
          showNavigation={true}
        />
      )}
    </section>
  );
};