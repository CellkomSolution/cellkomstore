"use client";

import * as React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { HeroBanner } from "@/lib/supabase/hero-banners";

const formSchema = z.object({
  image_url: z.string().url({ message: "URL gambar tidak valid." }),
  title: z.string().min(3, { message: "Judul minimal 3 karakter." }).max(100, { message: "Judul maksimal 100 karakter." }),
  description: z.string().max(250, { message: "Deskripsi maksimal 250 karakter." }).nullable().default(null),
  button_text: z.string().max(50, { message: "Teks tombol maksimal 50 karakter." }).nullable().default(null),
  button_link: z.string().url({ message: "URL tautan tombol tidak valid." }).nullable().default(null),
  order: z.coerce.number().min(0, { message: "Urutan tidak boleh negatif." }).default(0),
  is_active: z.boolean().default(true),
});

export type HeroBannerFormValues = z.infer<typeof formSchema>;

interface HeroBannerFormProps {
  initialData?: HeroBanner | null;
  onSubmit: (values: HeroBannerFormValues) => Promise<void>;
  loading?: boolean;
}

export function HeroBannerForm({ initialData, onSubmit, loading = false }: HeroBannerFormProps) {
  const form = useForm<HeroBannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image_url: initialData?.image_url ?? "",
      title: initialData?.title ?? "",
      description: initialData?.description ?? null,
      button_text: initialData?.button_text ?? null,
      button_link: initialData?.button_link ?? null,
      order: initialData?.order ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleImageUploadSuccess = (newUrl: string) => {
    form.setValue("image_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", "", { shouldValidate: true }); // Set to empty string for validation
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormItem>
          <FormLabel>Gambar Banner</FormLabel>
          <FormControl>
            <ImageUploader
              bucketName="hero-banner-images"
              currentImageUrl={form.watch("image_url")}
              onUploadSuccess={handleImageUploadSuccess}
              onRemove={handleRemoveImage}
              disabled={loading}
              aspectRatio="aspect-video"
            />
          </FormControl>
          <FormDescription>
            Unggah gambar utama untuk hero banner. Rasio aspek 16:9 direkomendasikan.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Banner</FormLabel>
              <FormControl>
                <Input placeholder="Judul menarik untuk banner" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat atau ajakan bertindak" className="resize-y min-h-[80px]" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="button_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teks Tombol (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Belanja Sekarang" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="button_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Tautan Tombol (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://cellkom.com/promo" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Jika diisi, tombol akan muncul dan dapat diklik.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif</FormLabel>
                <FormDescription>
                  Aktifkan untuk menampilkan banner ini di situs.
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

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? "Simpan Perubahan" : "Buat Banner"
          )}
        </Button>
      </form>
    </Form>
  );
}