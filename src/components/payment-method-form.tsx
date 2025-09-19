"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { ImageUploader } from "@/components/image-uploader";

// Define schemas for different detail types
const bankTransferDetailsSchema = z.object({
  bank_name: z.string().min(1, "Nama bank tidak boleh kosong."),
  account_name: z.string().min(1, "Nama pemilik rekening tidak boleh kosong."),
  account_number: z.string().min(5, "Nomor rekening tidak valid."),
});

const eWalletDetailsSchema = z.object({
  e_wallet_name: z.string().min(1, "Nama e-wallet tidak boleh kosong."),
  phone_number_or_id: z.string().min(5, "Nomor telepon/ID e-wallet tidak valid."),
});

const cardDetailsSchema = z.object({
  card_type: z.string().min(1, "Tipe kartu tidak boleh kosong."),
  last_four_digits: z.string().length(4, "Empat digit terakhir kartu tidak valid.").optional().nullable(),
});

const otherDetailsSchema = z.string().min(1, "Detail tidak boleh kosong.").nullable();

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama metode pembayaran minimal 3 karakter." }).max(100, { message: "Nama metode pembayaran maksimal 100 karakter." }),
  type: z.enum(['bank_transfer', 'e_wallet', 'card', 'other'], { message: "Tipe metode pembayaran harus dipilih." }),
  image_url: z.string().url({ message: "URL gambar tidak valid." }).nullable().default(null),
  is_active: z.boolean().default(true),
  order: z.coerce.number().min(0, { message: "Urutan tidak boleh negatif." }).default(0),
  // Conditional fields for details, handled in onSubmit
  bank_name: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  e_wallet_name: z.string().optional().nullable(),
  phone_number_or_id: z.string().optional().nullable(),
  card_type: z.string().optional().nullable(),
  last_four_digits: z.string().optional().nullable(),
  other_details_text: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.type === 'bank_transfer') {
    const result = bankTransferDetailsSchema.safeParse({
      bank_name: data.bank_name,
      account_name: data.account_name,
      account_number: data.account_number,
    });
    if (!result.success) {
      result.error.issues.forEach(issue => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path,
        });
      });
    }
  } else if (data.type === 'e_wallet') {
    const result = eWalletDetailsSchema.safeParse({
      e_wallet_name: data.e_wallet_name,
      phone_number_or_id: data.phone_number_or_id,
    });
    if (!result.success) {
      result.error.issues.forEach(issue => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path,
        });
      });
    }
  } else if (data.type === 'card') {
    const result = cardDetailsSchema.safeParse({
      card_type: data.card_type,
      last_four_digits: data.last_four_digits,
    });
    if (!result.success) {
      result.error.issues.forEach(issue => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path,
        });
      });
    }
  } else if (data.type === 'other') {
    const result = otherDetailsSchema.safeParse(data.other_details_text);
    if (!result.success) {
      result.error.issues.forEach(issue => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: ['other_details_text'],
        });
      });
    }
  }
});

// Derive the form values type directly from the schema
export type PaymentMethodFormValues = z.infer<typeof formSchema>;

interface PaymentMethodFormProps {
  initialData?: PaymentMethod | null;
  onSubmit: (values: PaymentMethodFormValues) => Promise<void>;
  loading?: boolean;
}

export function PaymentMethodForm({ initialData, onSubmit, loading = false }: PaymentMethodFormProps) {
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      type: initialData?.type ?? 'bank_transfer',
      image_url: initialData?.image_url ?? null,
      is_active: initialData?.is_active ?? true,
      order: initialData?.order ?? 0,
      // Initialize conditional fields from initialData.details
      bank_name: initialData?.type === 'bank_transfer' ? initialData.details?.bank_name ?? null : null,
      account_name: initialData?.type === 'bank_transfer' ? initialData.details?.account_name ?? null : null,
      account_number: initialData?.type === 'bank_transfer' ? initialData.details?.account_number ?? null : null,
      e_wallet_name: initialData?.type === 'e_wallet' ? initialData.details?.e_wallet_name ?? null : null,
      phone_number_or_id: initialData?.type === 'e_wallet' ? initialData.details?.phone_number_or_id ?? null : null,
      card_type: initialData?.type === 'card' ? initialData.details?.card_type ?? null : null,
      last_four_digits: initialData?.type === 'card' ? initialData.details?.last_four_digits ?? null : null,
      other_details_text: initialData?.type === 'other' ? initialData.details ?? null : null,
    },
  });

  const selectedType = form.watch('type');

  const handleImageUploadSuccess = (newUrl: string) => {
    form.setValue("image_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", null, { shouldValidate: true });
  };

  const handleSubmitWithDetails: SubmitHandler<PaymentMethodFormValues> = async (values) => {
    let details: any = null;
    if (values.type === 'bank_transfer') {
      details = {
        bank_name: values.bank_name,
        account_name: values.account_name,
        account_number: values.account_number,
      };
    } else if (values.type === 'e_wallet') {
      details = {
        e_wallet_name: values.e_wallet_name,
        phone_number_or_id: values.phone_number_or_id,
      };
    } else if (values.type === 'card') {
      details = {
        card_type: values.card_type,
        last_four_digits: values.last_four_digits,
      };
    } else if (values.type === 'other') {
      details = values.other_details_text; // Store as plain text for 'other'
    }

    // Pass the constructed details object to the parent onSubmit
    await onSubmit({ ...values, details });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithDetails)} className="space-y-8">
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

        <FormItem>
          <FormLabel>Logo Metode Pembayaran (Opsional)</FormLabel>
          <FormControl>
            <ImageUploader
              bucketName="app-assets" // Changed to 'app-assets'
              currentImageUrl={form.watch("image_url")}
              onUploadSuccess={handleImageUploadSuccess}
              onRemove={handleRemoveImage}
              disabled={loading}
              aspectRatio="aspect-square"
              className="max-w-[100px]"
            />
          </FormControl>
          <FormDescription>
            Unggah logo untuk metode pembayaran ini.
          </FormDescription>
          <FormMessage />
        </FormItem>

        {/* Conditional Details Fields */}
        {selectedType === 'bank_transfer' && (
          <>
            <h3 className="text-lg font-semibold mt-8">Detail Transfer Bank</h3>
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bank</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Bank BCA" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pemilik Rekening</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: PT Cellkom Store" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Rekening</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 1234567890" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedType === 'e_wallet' && (
          <>
            <h3 className="text-lg font-semibold mt-8">Detail E-Wallet</h3>
            <FormField
              control={form.control}
              name="e_wallet_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama E-Wallet</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: GoPay, OVO, Dana" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number_or_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon / ID E-Wallet</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 081234567890" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedType === 'card' && (
          <>
            <h3 className="text-lg font-semibold mt-8">Detail Kartu Kredit/Debit</h3>
            <FormField
              control={form.control}
              name="card_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Kartu</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Visa, Mastercard" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_four_digits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empat Digit Terakhir Kartu (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 1234" maxLength={4} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Hanya untuk tujuan identifikasi.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {selectedType === 'other' && (
          <>
            <h3 className="text-lg font-semibold mt-8">Detail Lainnya</h3>
            <FormField
              control={form.control}
              name="other_details_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruksi / Detail Tambahan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan instruksi atau detail pembayaran lainnya di sini."
                      className="resize-y min-h-[120px]"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

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