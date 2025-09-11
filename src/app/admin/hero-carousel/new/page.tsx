"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCarouselForm } from "@/components/hero-carousel-form";
import { toast } from "sonner";
import { createHeroCarouselSlide } from "@/lib/supabase-queries";

export default function NewHeroCarouselSlidePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Clean up values for Supabase insertion
      const slideData = {
        ...values,
        original_price: values.original_price === 0 ? null : values.original_price,
        discounted_price: values.discounted_price === 0 ? null : values.discounted_price,
        product_image_url: values.product_image_url || null,
        logo_url: values.logo_url || null,
        hashtag: values.hashtag || null,
        left_panel_bg_color: values.left_panel_bg_color || null,
      };

      await createHeroCarouselSlide(slideData);

      toast.success("Slide carousel berhasil ditambahkan!");
      router.push("/admin/hero-carousel");
    } catch (error: any) {
      toast.error("Gagal menambah slide carousel: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Tambah Slide Hero Carousel Baru</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Slide</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroCarouselForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}