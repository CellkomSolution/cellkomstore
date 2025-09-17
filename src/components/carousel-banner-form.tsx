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
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { CarouselBanner } from "@/lib/supabase/carousel-banners";

const formSchema = z.object({
  image_url: z.string().url({ message: "URL gambar tidak valid." }).nullable().default(null), // Allow null
  title: z.string().max(100, { message: "Judul maksimal 100 karakter." }).nullable().default(null),
  description: z.string().max(250, { message: "Deskripsi maksimal 250 karakter." }).nullable().default(null),
  link_url: z.string().url({ message: "URL tautan tidak valid." }).nullable().default(null),
  order: z.coerce.number().min(0, { message: "Urutan tidak boleh negatif." }).default(0),
});

export type CarouselBannerFormValues = z.infer<typeof formSchema>;

interface CarouselBannerFormProps {
  initialData?: CarouselBanner | null;
  onSubmit: (values: CarouselBannerFormValues) => Promise<void>;
  loading?: boolean;
}

export const CarouselBannerForm = React.forwardRef<any, CarouselBannerFormProps>(
  ({ initialData, onSubmit, loading = false }, ref) => {
    const form = useForm<CarouselBannerFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        image_url: initialData?.image_url ?? null, // Use null
        title: initialData?.title ?? null,
        description: initialData?.description ?? null,
        link_url: initialData?.link_url ?? null,
        order: initialData?.order ?? 0,
      },
    });

    // Expose the form's reset method to the parent component
    React.useImperativeHandle(ref, () => ({
      reset: form.reset,
    }));

    React.useEffect(() => {
      // Reset form when initialData changes (e.g., when editing a different banner)
      form.reset({
        image_url: initialData?.image_url ?? null, // Use null
        title: initialData?.title ?? null,
        description: initialData?.description ?? null,
        link_url: initialData?.link_url ?? null,
        order: initialData?.order ?? 0,
      });
    }, [initialData, form]);

    const handleImageUploadSuccess = (newUrl: string) => {
      form.setValue("image_url", newUrl, { shouldValidate: true });
    };

    const handleRemoveImage = () => {
      form.setValue("image_url", null, { shouldValidate: true }); // Set to null
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormItem>
            <FormLabel>Gambar Banner</FormLabel>
            <FormControl>
              <ImageUploader
                bucketName="carousel-banner-images"
                currentImageUrl={form.watch("image_url")}
                onUploadSuccess={handleImageUploadSuccess}
                onRemove={handleRemoveImage}
                disabled={loading}
                aspectRatio="aspect-video"
                className="max-w-lg"
              />
            </FormControl>
            <FormDescription>
              Unggah gambar utama untuk banner carousel. Ukuran yang disarankan: 1200x480px (rasio 5:2).
            </FormDescription>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Banner (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Judul menarik" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Teks utama yang akan ditampilkan di banner.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Banner (Opsional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Deskripsi singkat tentang promosi atau produk"
                    className="resize-y min-h-[80px]"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Deskripsi tambahan yang akan ditampilkan di banner.
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
                  <Input placeholder="https://cellkom.com/promo-spesial" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>
                  Tautan yang akan dituju saat banner atau tombol diklik.
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
);