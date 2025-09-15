"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form"; // Import SubmitHandler
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PaymentMethod } from "@/lib/supabase/payment-methods";

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama metode pembayaran minimal 3 karakter." }).max(100, { message: "Nama metode pembayaran maksimal 100 karakter." }),
  type: z.enum(['bank_transfer', 'e_wallet', 'card', 'other'], { message: "Tipe metode pembayaran harus dipilih." }),
  details: z.string().optional().nullable(), // JSON string for details
  is_active: z.boolean().default(true),
  order: z.coerce.number().min(0, { message: "Urutan tidak boleh negatif." }).default(0),
});

export type PaymentMethodFormValues = z.infer<typeof formSchema>;

interface PaymentMethodFormProps {
  initialData?: PaymentMethod | null;
  onSubmit: (values: PaymentMethodFormValues) => Promise<void>;
  loading?: boolean;
}

export function PaymentMethodForm({ initialData, onSubmit, loading = false }: PaymentMethodFormProps) {
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Explicitly set default values here
      name: initialData?.name ?? "",
      type: initialData?.type ?? 'bank_transfer',
      details: initialData?.details ? JSON.stringify(initialData.details, null, 2) : null,
      is_active: initialData?.is_active ?? true, // Must be boolean
      order: initialData?.order ?? 0, // Must be number
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Metode Pembayaran</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Bank Transfer BCA" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Nama yang akan ditampilkan kepada pengguna.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Metode Pembayaran</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                  <SelectItem value="card">Kartu Kredit/Debit</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detail Instruksi (JSON/Teks Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"bank_name": "BCA", "account_number": "1234567890", "account_name": "PT Cellkom Store"}'
                  className="resize-y min-h-[120px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Instruksi atau detail tambahan untuk metode pembayaran ini (misalnya, nomor rekening, QR code URL). Bisa berupa teks biasa atau JSON.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif</FormLabel>
                <FormDescription>
                  Aktifkan untuk menampilkan metode pembayaran ini kepada pengguna.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urutan Tampilan</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} value={field.value ?? 0} />
              </FormControl>
              <FormDescription>
                Angka yang lebih rendah akan muncul lebih dulu.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? "Simpan Perubahan" : "Buat Metode Pembayaran"
          )}
        </Button>
      </form>
    </Form>
  );
}