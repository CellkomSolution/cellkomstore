"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCarouselForm } from "@/components/hero-carousel-form";
import { toast } from "sonner";
import { getHeroCarouselSlideById, updateHeroCarouselSlide, HeroCarouselSlide } from "@/lib/supabase/hero-carousel"; // Import dari modul hero-carousel
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton";

export default function EditHeroCarouselSlidePage({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params); // Menggunakan React.use() untuk meng-unwrap params
  const { id } = unwrappedParams; // Mengakses id dari objek yang sudah di-unwrap
  const router = useRouter();

  const [initialData, setInitialData] = React.useState<HeroCarouselSlide | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchSlide() {
      setIsLoading(true);
      const slide = await getHeroCarouselSlideById(id);
      if (slide) {
        setInitialData(slide);
      } else {
        toast.error("Slide carousel tidak ditemukan.");
        router.push("/admin/hero-carousel");
      }
      setIsLoading(false);
    }
    fetchSlide();
  }, [id, router]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      let slideData = { ...values };

      if (values.display_style === 'full') {
        slideData = {
          ...slideData,
          logo_url: null,
          product_name: null,
          original_price: null,
          discounted_price: null,
          is_new: false,
          hashtag: null,
          left_panel_bg_color: null,
        };
      }

      await updateHeroCarouselSlide(id, slideData);

      toast.success("Slide carousel berhasil diperbarui!");
      router.push("/admin/hero-carousel");
    } catch (error: any) {
      toast.error("Gagal memperbarui slide carousel: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Memuat Slide...</h2>
        <ProductDetailPageSkeleton />
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Edit Slide: {initialData.product_name || initialData.alt}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Slide</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroCarouselForm initialData={initialData} onSubmit={onSubmit} loading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}