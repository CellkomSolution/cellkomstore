"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/product-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getProductById, updateProduct, Product } from "@/lib/supabase/products"; // Import updateProduct
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params; // Mengakses id langsung dari params
  const router = useRouter();

  const [initialData, setInitialData] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const product = await getProductById(id);
      if (product) {
        setInitialData(product);
      } else {
        toast.error("Produk tidak ditemukan.");
        router.push("/admin/products");
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [id, router]);

  const onSubmit = async (values: any, additionalImageUpdates: { id?: string; imageUrl: string; order: number; _delete?: boolean }[]) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk mengedit produk.");
        router.push("/auth");
        return;
      }

      await updateProduct(id, {
        name: values.name,
        price: values.price,
        originalPrice: values.originalPrice,
        mainImageUrl: values.mainImageUrl, // Renamed
        location: values.location,
        category: values.category,
        isFlashSale: values.isFlashSale,
        description: values.description,
      }, additionalImageUpdates); // Pass all additional image updates

      toast.success("Produk berhasil diperbarui!");
      router.push("/admin/products");
    } catch (error: any) {
      toast.error("Gagal memperbarui produk: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Memuat Produk...</h2>
        <ProductDetailPageSkeleton />
      </div>
    );
  }

  if (!initialData) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Edit Produk: {initialData.name}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={initialData} onSubmit={onSubmit} loading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}