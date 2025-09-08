"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCarouselForm } from "@/components/hero-carousel-form";
import { toast } from "sonner";
import { getHeroCarouselSlideById, updateHeroCarouselSlide, HeroCarouselSlide } from "@/lib/supabase-queries";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton"; // Reusing skeleton for loading state

export default function EditHeroCarouselSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
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
      // Clean up values for Supabase update
      const slideData = {
        ...values,
        original_price: values.original_price === 0 ? null : values.original_price,
        discounted_price: values.discounted_price === 0 ? null : values.discounted_price,
        product_image_url: values.product_image_url || null,
        logo_url: values.logo_url || null,
        hashtag: values.hashtag || null,
        left_panel_bg_color: values.left_panel_bg_color || null,
        left_peek_image_url: values.left_peek_image_url || null,
        left_peek_alt: values.left_peek_alt || null,
        left_peek_bg_color: values.left_peek_bg_color || null,
        right_peek_image_url: values.right_peek_image_url || null,
        right_peek_logo_url: values.right_peek_logo_url || null,
        right_peek_alt: values.right_peek_alt || null,
        right_peek_bg_color: values.right_peek_bg_color || null,
        right_peek_hashtag: values.right_peek_hashtag || null,
      };

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
    return null; // Redirect handled in useEffect
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