"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodForm } from "@/components/payment-method-form";
import { toast } from "sonner";
import { getPaymentMethodById, updatePaymentMethod, PaymentMethod } from "@/lib/supabase/payment-methods";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton"; // Reusing skeleton

export default function EditPaymentMethodPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [initialData, setInitialData] = React.useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchPaymentMethod() {
      setIsLoading(true);
      const method = await getPaymentMethodById(id);
      if (method) {
        setInitialData(method);
      } else {
        toast.error("Metode pembayaran tidak ditemukan.");
        router.push("/admin/payment-methods");
      }
      setIsLoading(false);
    }
    fetchPaymentMethod();
  }, [id, router]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (!initialData) {
        toast.error("Data metode pembayaran tidak tersedia untuk diperbarui.");
        return;
      }

      const methodData = {
        name: values.name,
        type: values.type,
        details: values.details ? JSON.parse(values.details) : null, // Parse JSON string to object
        is_active: values.is_active,
        order: values.order,
      };

      await updatePaymentMethod(initialData.id, methodData);

      toast.success("Metode pembayaran berhasil diperbarui!");
      router.push("/admin/payment-methods");
    } catch (error: any) {
      console.error("Error updating payment method:", error);
      toast.error("Gagal memperbarui metode pembayaran: " + (error.message || "Format detail JSON tidak valid."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Memuat Metode Pembayaran...</h2>
        <ProductDetailPageSkeleton />
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Edit Metode Pembayaran: {initialData.name}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodForm initialData={initialData} onSubmit={onSubmit} loading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}