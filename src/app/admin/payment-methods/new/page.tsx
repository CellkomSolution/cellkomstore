"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodForm, PaymentMethodFormValues, PaymentMethodSubmitValues } from "@/components/payment-method-form";
import { toast } from "sonner";
import { createPaymentMethod } from "@/lib/supabase/payment-methods";

export default function NewPaymentMethodPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (values: PaymentMethodSubmitValues) => {
    setLoading(true);
    try {
      const methodData = {
        name: values.name,
        type: values.type,
        details: values.details,
        is_active: values.is_active || false, // Ensure it's boolean
        order: values.order,
        image_url: values.image_url, // Include image_url
      };

      await createPaymentMethod(methodData);

      toast.success("Metode pembayaran berhasil ditambahkan!");
      router.push("/admin/payment-methods");
    } catch (error: any) {
      console.error("Error creating payment method:", error);
      toast.error("Gagal menambah metode pembayaran: " + (error.message || "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Tambah Metode Pembayaran Baru</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detail Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}