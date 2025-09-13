"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { HeroCarouselSlide } from "@/lib/supabase/hero-carousel";
import { ImageUploader } from "@/components/image-uploader"; // Import ImageUploader yang sudah ada

const formSchema = z.object({
  display_style: z.enum(['full', 'split']),
  product_image_url: z.string().url({ message: "URL gambar produk tidak valid." }).nullable(),
  alt: z.string().min(3, { message: "Teks alternatif minimal 3 karakter." }),
  link_url: z.string().url({ message: "URL tautan tidak valid." }).nullable(),
  order: z.coerce.number().min(0),
  logo_url: z.string().url({ message: "URL logo tidak valid." }).nullable(),
  product_name: z.string().nullable(),
  original_price: z.coerce.number().min(0).nullable(),
  discounted_price: z.coerce.number().min(0).nullable(),
  is_new: z.boolean(),
  hashtag: z.string().nullable(),
  left_panel_bg_color: z.string().nullable(),
});

type HeroCarouselFormValues = z.infer<typeof formSchema>;

interface HeroCarouselFormProps {
  initialData?: HeroCarouselSlide | null;
  onSubmit: (values: HeroCarouselFormValues) => Promise<void>;
  loading?: boolean;
}

export function HeroCarouselForm({ initialData, onSubmit, loading = false }: HeroCarouselFormProps) {
  const router = useRouter();
  
  const defaultValues: HeroCarouselFormValues = {
    display_style: initialData?.display_style ?? 'split',
    product_image_url: initialData?.product_image_url ?? null,
    alt: initialData?.alt ?? "",
    link_url: initialData?.link_url ?? null,
    order: initialData?.order ?? 0,
    logo_url: initialData?.logo_url ?? null,
    product_name: initialData?.product_name ?? null,
    original_price: initialData?.original_price ?? null,
    discounted_price: initialData?.discounted_price ?? null,
    is_new: initialData?.is_new ?? false,
    hashtag: initialData?.hashtag ?? null,
    left_panel_bg_color: initialData?.left_panel_bg_color ?? null,
  };

  const form = useForm<HeroCarouselFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const displayStyle = form.watch('display_style');

  const handleProductImageUploadSuccess = (newUrl: string) => {
    form.setValue("product_image_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveProductImage = () => {
    form.setValue("product_image_url", null, { shouldValidate: true });
  };

  const handleLogoUploadSuccess = (newUrl: string) => {
    form.setValue("logo_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveLogo = () => {
    form.setValue("logo_url", null, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="display_style"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipe Tampilan Banner</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="split" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Split (Teks & Gambar)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="full" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Full (Gambar Penuh)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Gambar Banner</FormLabel>
          <FormControl>
            <ImageUploader
              bucketName="carousel-images"
              currentImageUrl={form.watch("product_image_url")}
              onUploadSuccess={handleProductImageUploadSuccess}
              onRemove={handleRemoveProductImage}
              disabled={loading}
              aspectRatio="aspect-video"
            />
          </FormControl>
          <FormDescription>
            Gambar utama yang akan ditampilkan di slide.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="alt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teks Alternatif (Alt Text)</FormLabel>
              <FormControl>
                <Input placeholder="Deskripsi singkat gambar untuk aksesibilitas" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Wajib diisi untuk SEO dan aksesibilitas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Tautan (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://contoh.com/produk/promo" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Jika diisi, seluruh slide akan menjadi tautan yang dapat diklik ke URL ini.
              </FormDescription>
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

        {displayStyle === 'split' && (
          <div className="space-y-8 border-t pt-8">
            <h3 className="text-lg font-semibold">Detail Panel Teks (Tampilan Split)</h3>
            <FormItem>
              <FormLabel>Logo Brand (Opsional)</FormLabel>
              <FormControl>
                <ImageUploader
                  bucketName="carousel-images"
                  currentImageUrl={form.watch("logo_url")}
                  onUploadSuccess={handleLogoUploadSuccess}
                  onRemove={handleRemoveLogo}
                  disabled={loading}
                  aspectRatio="aspect-square"
                  className="max-w-[150px]"
                />
              </FormControl>
              <FormDescription>
                Logo brand yang akan muncul di atas nama produk.
              </FormDescription>
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk/Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama produk atau judul promosi" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="original_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Asli (Opsional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} />
                    </FormControl>
                    <FormDescription>
                      Harga sebelum diskon.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discounted_price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Harga Diskon (Opsional)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} />
                        </FormControl>
                        <FormDescription>
                            Harga setelah diskon.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            </div>
            <FormField
              control={form.control}
              name="is_new"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Produk Baru</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Tandai jika ini adalah produk atau promosi baru.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hashtag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtag (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="#PROMODASYAT" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Teks kecil di bawah harga/judul.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="left_panel_bg_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna Latar Belakang Panel Kiri (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="bg-blue-100 dark:bg-blue-950" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Kelas Tailwind CSS untuk warna latar belakang panel teks kiri (mis. `bg-red-100 dark:bg-red-900`).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? "Simpan Perubahan" : "Buat Slide"
          )}
        </Button>
      </form>
    </Form>
  );
}