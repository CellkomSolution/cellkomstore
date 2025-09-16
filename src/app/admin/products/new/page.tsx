"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/product-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { createProduct, Product } from "@/lib/supabase/products"; // Import createProduct

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: any, additionalImageUpdates: { id?: string; imageUrl: string | null; order: number; _delete?: boolean }[]) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk menambah produk.");
        router.push("/auth");
        return;
      }

      // Extract only new image URLs for creation, filtering out nulls
      const newAdditionalImageUrls = additionalImageUpdates
        .filter(img => !img.id && img.imageUrl && !img._delete)
        .sort((a, b) => a.order - b.order)
        .map(img => img.imageUrl);

      await createProduct({
        name: values.name,
        price: values.price,
        originalPrice: values.originalPrice,
        mainImageUrl: values.mainImageUrl,
        location: values.location,
        category: values.category,
        isFlashSale: values.isFlashSale,
        description: values.description,
      }, newAdditionalImageUrls as string[]); // Cast to string[] after filtering nulls

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