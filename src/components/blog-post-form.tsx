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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BlogPost } from "@/lib/supabase/blog-posts";
import { ImageUploader } from "@/components/image-uploader";
import { useSession } from "@/context/session-context"; // Import useSession

const formSchema = z.object({
  title: z.string().min(5, { message: "Judul minimal 5 karakter." }).max(200, { message: "Judul maksimal 200 karakter." }),
  slug: z.string().min(5, { message: "Slug minimal 5 karakter." }).max(200, { message: "Slug maksimal 200 karakter." }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug harus berupa huruf kecil, angka, dan tanda hubung (tanpa spasi)." }),
  content: z.string().min(50, { message: "Konten minimal 50 karakter." }),
  image_url: z.string().url({ message: "URL gambar tidak valid." }).nullable().default(null),
  is_published: z.boolean().default(false),
});

// Derive the form values type directly from the schema
export type BlogPostFormValues = z.infer<typeof formSchema>;

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  onSubmit: (values: BlogPostFormValues) => Promise<void>;
  loading?: boolean;
}

export function BlogPostForm({ initialData, onSubmit, loading = false }: BlogPostFormProps) {
  const { user } = useSession();
  const router = useRouter();

  const defaultValues: BlogPostFormValues = {
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    content: initialData?.content ?? "",
    image_url: initialData?.image_url ?? null,
    is_published: initialData?.is_published ?? false,
  };

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleImageUploadSuccess = (newUrl: string) => {
    form.setValue("image_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", null, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Postingan</FormLabel>
              <FormControl>
                <Input placeholder="Judul menarik untuk blog Anda" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug Postingan</FormLabel>
              <FormControl>
                <Input placeholder="judul-menarik-untuk-blog-anda" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                Slug unik untuk URL (huruf kecil, tanpa spasi, gunakan tanda hubung).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten Postingan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis konten blog Anda di sini..."
                  className="resize-y min-h-[200px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Gunakan HTML dasar untuk format (misalnya `&lt;p&gt;`, `&lt;strong&gt;`, `&lt;ul&gt;`, `&lt;li&gt;`).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Gambar Utama</FormLabel>
          <FormControl>
            <ImageUploader
              bucketName="blog-images"
              currentImageUrl={form.watch("image_url") ?? null}
              onUploadSuccess={handleImageUploadSuccess}
              onRemove={handleRemoveImage}
              disabled={loading}
              aspectRatio="aspect-video"
            />
          </FormControl>
          <FormDescription>
            Gambar utama yang akan ditampilkan di postingan blog.
          </FormDescription>
          <FormMessage />
        </FormItem>
        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publikasikan</FormLabel>
                <FormDescription>
                  Aktifkan untuk membuat postingan blog ini terlihat oleh publik.
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
            initialData ? "Simpan Perubahan" : "Buat Postingan"
          )}
        </Button>
      </form>
    </Form>
  );
}