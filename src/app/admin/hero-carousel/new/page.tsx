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
      let slideData = { ...values };

      // Jika tampilan 'full', hapus data yang hanya relevan untuk 'split'
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