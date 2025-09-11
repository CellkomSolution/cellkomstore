"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/components/category-form";
import { toast } from "sonner";
import { createCategory } from "@/lib/supabase/categories"; // Import createCategory dari modul categories

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const categoryData = {
        name: values.name,
        slug: values.slug,
        icon_name: values.icon_name || null,
        order: values.order,
      };

      await createCategory(categoryData);

      toast.success("Kategori berhasil ditambahkan!");
      router.push("/admin/categories");
    } catch (error: any) {
      toast.error("Gagal menambah kategori: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Tambah Kategori Baru</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}