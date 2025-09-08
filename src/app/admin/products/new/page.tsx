"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/product-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk menambah produk.");
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .insert({
          name: values.name,
          price: values.price,
          original_price: values.originalPrice === 0 ? null : values.originalPrice,
          image_url: values.imageUrl,
          location: values.location,
          category: values.category,
          is_flash_sale: values.isFlashSale,
          description: values.description,
          rating: 0, // Default rating
          sold_count: "0", // Default sold count
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      toast.success("Produk berhasil ditambahkan!");
      router.push("/admin/products");
    } catch (error: any) {
      toast.error("Gagal menambah produk: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Tambah Produk Baru</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}