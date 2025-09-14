"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/components/category-form";
import { toast } from "sonner";
import { getCategoryBySlug, updateCategory, Category } from "@/lib/supabase/categories"; // Import dari modul categories
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton";

export default function EditCategoryPage({ params }: { params: { slug: string } }) {
  const unwrappedParams = React.use(params); // Menggunakan React.use() untuk meng-unwrap params
  const { slug } = unwrappedParams; // Mengakses slug dari objek yang sudah di-unwrap
  const router = useRouter();

  const [initialData, setInitialData] = React.useState<Category | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchCategory() {
      setIsLoading(true);
      const category = await getCategoryBySlug(slug);
      if (category) {
        setInitialData(category);
      } else {
        toast.error("Kategori tidak ditemukan.");
        router.push("/admin/categories");
      }
      setIsLoading(false);
    }
    fetchCategory();
  }, [slug, router]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (!initialData) {
        toast.error("Data kategori tidak tersedia untuk diperbarui.");
        return;
      }

      const categoryData = {
        name: values.name,
        slug: values.slug,
        icon_name: values.icon_name || null,
        order: values.order,
      };

      await updateCategory(initialData.id, categoryData);

      toast.success("Kategori berhasil diperbarui!");
      router.push("/admin/categories");
    } catch (error: any) {
      toast.error("Gagal memperbarui kategori: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Memuat Kategori...</h2>
        <ProductDetailPageSkeleton />
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Edit Kategori: {initialData.name}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm initialData={initialData} onSubmit={onSubmit} loading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}