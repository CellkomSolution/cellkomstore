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
import { supabase } from "@/integrations/supabase/client";
import Image from "next/image";
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import { HeroCarouselSlide } from "@/lib/supabase/hero-carousel"; // Import HeroCarouselSlide dari modul hero-carousel

const formSchema = z.object({
  display_style: z.enum(['full', 'split']).default('split'),
  product_image_url: z.string().url({ message: "URL gambar produk tidak valid." }).min(1, "URL Gambar Produk harus diisi."),
  alt: z.string().min(3, { message: "Teks alternatif minimal 3 karakter." }),
  link_url: z.string().url({ message: "URL tautan tidak valid." }).nullable().optional(),
  order: z.coerce.number().min(0).optional(),
  // Optional fields for split view
  logo_url: z.string().url({ message: "URL logo tidak valid." }).nullable().optional(),
  product_name: z.string().nullable().optional(),
  original_price: z.coerce.number().min(0).nullable().optional(),
  discounted_price: z.coerce.number().min(0).nullable().optional(),
  is_new: z.boolean().default(false).optional(),
  hashtag: z.string().nullable().optional(),
  left_panel_bg_color: z.string().nullable().optional(),
});

type HeroCarouselFormValues = z.infer<typeof formSchema>; // Define explicit type

interface HeroCarouselFormProps {
  initialData?: HeroCarouselSlide | null;
  onSubmit: (values: HeroCarouselFormValues) => Promise<void>; // Use explicit type here
  loading?: boolean;
}

type ImageFieldName = 'product_image_url' | 'logo_url';

export function HeroCarouselForm({ initialData, onSubmit, loading = false }: HeroCarouselFormProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeUploader, setActiveUploader] = React.useState<ImageFieldName | null>(null);
  const [imagePreviews, setImagePreviews] = React.useState<{ [key in ImageFieldName]: string | null }>({
    product_image_url: initialData?.product_image_url || null,
    logo_url: initialData?.logo_url || null,
  });
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const defaultValues = {
    display_style: initialData?.display_style ?? 'split',
    product_image_url: initialData?.product_image_url ?? "",
    alt: initialData?.alt ?? "",
    link_url: initialData?.link_url ?? null,
    logo_url: initialData?.logo_url ?? null,
    product_name: initialData?.product_name ?? null,
    original_price: initialData?.original_price ?? null,
    discounted_price: initialData?.discounted_price ?? null,
    is_new: initialData?.is_new ?? false,
    hashtag: initialData?.hashtag ?? null,
    left_panel_bg_color: initialData?.left_panel_bg_color ?? null,
    order: initialData?.order ?? 0,
  } as HeroCarouselFormValues; // Explicit cast here

  const form = useForm<HeroCarouselFormValues>({ // Use the explicit type here
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const displayStyle = form.watch('display_style');

  const triggerFileInput = (fieldName: ImageFieldName) => {
    if (loading || isUploadingImage) return;
    setActiveUploader(fieldName);
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: ImageFieldName) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploadingImage(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("carousel-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("carousel-images")
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) throw new Error("Tidak bisa mendapatkan URL publik untuk gambar.");

      setImagePreviews((prev) => ({ ...prev, [fieldName]: publicUrlData.publicUrl }));
      form.setValue(fieldName, publicUrlData.publicUrl, { shouldValidate: true });
      toast.success("Gambar berhasil diunggah!");
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message);
      setImagePreviews((prev) => ({ ...prev, [fieldName]: null }));
      form.setValue(fieldName, null as any); // Cast to any to allow null for optional fields
    } finally {
      setIsUploadingImage(false);
      setActiveUploader(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (fieldName: ImageFieldName) => {
    setImagePreviews((prev) => ({ ...prev, [fieldName]: null }));
    form.setValue(fieldName, null as any); // Cast to any to allow null for optional fields
  };

  const ImageUploader = ({ fieldName, label, description }: { fieldName: ImageFieldName, label: string, description?: string }) => (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div>
          {imagePreviews[fieldName] ? (
            <div className="relative h-48 w-full max-w-md">
              <Image
                src={imagePreviews[fieldName]!}
                alt={`${label} Preview`}
                fill
                style={{ objectFit: "contain" }}
                className="p-2 border rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-6 w-6"
                onClick={() => removeImage(fieldName)}
                disabled={loading || isUploadingImage}
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Hapus Gambar</span>
              </Button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30"
              onClick={() => triggerFileInput(fieldName)}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => activeUploader && handleImageUpload(e, activeUploader)}
                disabled={loading || isUploadingImage}
              />
              {isUploadingImage && activeUploader === fieldName ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Mengunggah...</p>
                </>
              ) : (
                <div className="text-center">
                  <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Klik untuk mengunggah</span> atau seret & lepas
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>
          )}
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* The hidden input for file upload is now inside ImageUploader */}
        
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

        <ImageUploader
          fieldName="product_image_url"
          label="Gambar Banner"
          description="Gambar utama yang akan ditampilkan di slide."
        />

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
            <ImageUploader
              fieldName="logo_url"
              label="Logo Brand (Opsional)"
              description="Logo brand yang akan muncul di atas nama produk."
            />
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
                        disabled={loading || isUploadingImage}
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

        <Button type="submit" disabled={loading || isUploadingImage}>
          {loading || isUploadingImage ? (
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