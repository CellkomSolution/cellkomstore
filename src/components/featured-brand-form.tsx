"use client";

import * as React from "react";
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
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { FeaturedBrand } from "@/lib/supabase/featured-brands";

const formSchema = z.object({
  image_url: z.string().url({ message: "URL gambar tidak valid." }).min(1, { message: "Gambar merek diperlukan." }),
  link_url: z.string().url({ message: "URL tautan tidak valid." }).nullable().optional().or(z.literal("")),
  order: z.coerce.number().min(0, { message: "Urutan tidak boleh negatif." }).default(0),
});

// Explicitly define the type to ensure non-optional fields are correctly typed
export type FeaturedBrandFormValues = {
  image_url: string;
  link_url: string | null | undefined; // Can be string, null, or undefined
  order: number; // Guaranteed number by .default(0)
};

interface FeaturedBrandFormProps {
  initialData?: FeaturedBrand | null;
  onSubmit: (values: FeaturedBrandFormValues) => Promise<void>;
  loading?: boolean;
}

export function FeaturedBrandForm({ initialData, onSubmit, loading = false }: FeaturedBrandFormProps) {
  const form = useForm<FeaturedBrandFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image_url: initialData?.image_url || "",
      link_url: initialData?.link_url ?? null, // Ensure null if undefined
      order: initialData?.order ?? 0, // Ensure number
    },
  });

  const handleImageUploadSuccess = (newUrl: string) => {
    form.setValue("image_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", "", { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormItem>
          <FormLabel>Gambar Merek</FormLabel>
          <FormControl>
            <ImageUploader
              bucketName="featured-brand-images"
              currentImageUrl={form.watch("image_url")}
              onUploadSuccess={handleImageUploadSuccess}
              onRemove={handleRemoveImage}
              disabled={loading}
              aspectRatio="aspect-square"
              className="max-w-[150px]"
            />
          </FormControl>
          <FormDescription>
            Unggah logo atau gambar merek unggulan.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="link_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Tautan (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/brand" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Tautan yang akan dituju saat merek diklik.
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
            initialData ? "Simpan Perubahan" : "Tambah Merek"
          )}
        </Button>
      </form>
    </Form>
  );
}