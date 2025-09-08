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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Image from "next/image";
import { Loader2, UploadCloud, XCircle } from "lucide-react";
import { HeroCarouselSlide } from "@/lib/supabase-queries"; // Import HeroCarouselSlide interface

const formSchema = z.object({
  type: z.enum(['full-banner', 'three-part'], { message: "Tipe slide harus dipilih." }),
  
  // Common fields
  product_image_url: z.string().url({ message: "URL gambar produk tidak valid." }).nullable().optional(),
  alt: z.string().min(3, { message: "Teks alternatif minimal 3 karakter." }),
  logo_url: z.string().url({ message: "URL logo tidak valid." }).nullable().optional(),
  product_name: z.string().nullable().optional(),
  original_price: z.coerce.number().min(0, { message: "Harga asli tidak boleh negatif." }).nullable().optional(),
  discounted_price: z.coerce.number().min(0, { message: "Harga diskon tidak boleh negatif." }).nullable().optional(),
  is_new: z.boolean().default(false).optional(),
  hashtag: z.string().nullable().optional(),
  left_panel_bg_color: z.string().nullable().optional(),
  order: z.coerce.number().min(0, { message: "Urutan tidak boleh negatif." }).default(0),

  // Three-part specific fields
  left_peek_image_url: z.string().url({ message: "URL gambar peek kiri tidak valid." }).nullable().optional(),
  left_peek_alt: z.string().nullable().optional(),
  left_peek_bg_color: z.string().nullable().optional(),
  right_peek_image_url: z.string().url({ message: "URL gambar peek kanan tidak valid." }).nullable().optional(),
  right_peek_logo_url: z.string().url({ message: "URL logo peek kanan tidak valid." }).nullable().optional(),
  right_peek_alt: z.string().nullable().optional(),
  right_peek_bg_color: z.string().nullable().optional(),
  right_peek_hashtag: z.string().nullable().optional(),
});

interface HeroCarouselFormProps {
  initialData?: HeroCarouselSlide | null;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  loading?: boolean;
}

export function HeroCarouselForm({ initialData, onSubmit, loading = false }: HeroCarouselFormProps) {
  const router = useRouter();
  const [imagePreviews, setImagePreviews] = React.useState<{ [key: string]: string | null }>({
    product_image_url: initialData?.product_image_url || null,
    logo_url: initialData?.logo_url || null,
    left_peek_image_url: initialData?.left_peek_image_url || null,
    right_peek_image_url: initialData?.right_peek_image_url || null,
    right_peek_logo_url: initialData?.right_peek_logo_url || null,
  });
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  // Explicitly define default values with the inferred schema type
  const defaultValues: z.infer<typeof formSchema> = {
    type: initialData?.type || 'full-banner',
    product_image_url: initialData?.product_image_url ?? null, // Use null for nullable optional fields
    alt: initialData?.alt ?? "",
    logo_url: initialData?.logo_url ?? null,
    product_name: initialData?.product_name ?? null,
    original_price: initialData?.original_price ?? null, // Use null
    discounted_price: initialData?.discounted_price ?? null, // Use null
    is_new: initialData?.is_new ?? false,
    hashtag: initialData?.hashtag ?? null,
    left_panel_bg_color: initialData?.left_panel_bg_color ?? null,
    order: initialData?.order ?? 0, // This should be fine as it's a number
    left_peek_image_url: initialData?.left_peek_image_url ?? null,
    left_peek_alt: initialData?.left_peek_alt ?? null,
    left_peek_bg_color: initialData?.left_peek_bg_color ?? null,
    right_peek_image_url: initialData?.right_peek_image_url ?? null,
    right_peek_logo_url: initialData?.right_peek_logo_url ?? null,
    right_peek_alt: initialData?.right_peek_alt ?? null,
    right_peek_bg_color: initialData?.right_peek_bg_color ?? null,
    right_peek_hashtag: initialData?.right_peek_hashtag ?? null,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues, // Pass the explicitly typed defaultValues
  });

  const currentSlideType = form.watch("type");

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof imagePreviews) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast.error("Anda harus memilih gambar untuk diunggah.");
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploadingImage(true);
    try {
      const { data, error: uploadError } = await supabase.storage
        .from("carousel-images") // Use the new bucket
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("carousel-images")
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Tidak bisa mendapatkan URL publik untuk gambar.");
      }

      setImagePreviews((prev) => ({ ...prev, [fieldName]: publicUrlData.publicUrl }));
      form.setValue(fieldName as any, publicUrlData.publicUrl, { shouldValidate: true });
      toast.success("Gambar berhasil diunggah!");
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message);
      setImagePreviews((prev) => ({ ...prev, [fieldName]: null }));
      form.setValue(fieldName as any, "");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (fieldName: keyof typeof imagePreviews) => {
    setImagePreviews((prev) => ({ ...prev, [fieldName]: null }));
    form.setValue(fieldName as any, "");
  };

  const ImageUploader = ({ fieldName, label, description }: { fieldName: keyof typeof imagePreviews, label: string, description?: string }) => (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 relative">
          {imagePreviews[fieldName] ? (
            <>
              <Image
                src={imagePreviews[fieldName]!}
                alt={`${label} Preview`}
                fill
                style={{ objectFit: "contain" }}
                className="p-2"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={() => removeImage(fieldName)}
                disabled={loading || isUploadingImage}
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Hapus Gambar</span>
              </Button>
            </>
          ) : (
            <>
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleImageUpload(e, fieldName)}
                disabled={loading || isUploadingImage}
              />
              {isUploadingImage ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="mt-2 text-sm text-muted-foreground text-center">
                {isUploadingImage ? "Mengunggah..." : "Klik untuk mengunggah atau seret & lepas"}
              </p>
            </>
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
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Slide</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe slide" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full-banner">Full Banner</SelectItem>
                  <SelectItem value="three-part">Three-Part Banner</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Pilih tata letak untuk slide carousel ini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
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
                Penting untuk SEO dan aksesibilitas.
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

        <h3 className="text-lg font-semibold mt-8">Detail Banner Utama</h3>
        <ImageUploader
          fieldName="product_image_url"
          label="Gambar Produk Utama"
          description="Gambar utama yang akan ditampilkan di slide."
        />
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
                  <Input type="number" placeholder="0" {...field} value={field.value ?? 0} />
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
                  <Input type="number" placeholder="0" {...field} value={field.value ?? 0} />
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
                <FormDescription>
                  Tandai jika ini adalah produk atau promosi baru.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading || isUploadingImage}
                />
              </FormControl>
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

        {currentSlideType === 'three-part' && (
          <>
            <h3 className="text-lg font-semibold mt-8">Detail Peek Kiri</h3>
            <ImageUploader
              fieldName="left_peek_image_url"
              label="Gambar Peek Kiri (Opsional)"
              description="Gambar kecil di sisi kiri slide tiga bagian."
            />
            <FormField
              control={form.control}
              name="left_peek_alt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teks Alternatif Peek Kiri (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Deskripsi gambar peek kiri" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="left_peek_bg_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna Latar Belakang Peek Kiri (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="bg-gray-100 dark:bg-gray-800" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Kelas Tailwind CSS untuk warna latar belakang peek kiri.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-semibold mt-8">Detail Peek Kanan</h3>
            <ImageUploader
              fieldName="right_peek_image_url"
              label="Gambar Peek Kanan (Opsional)"
              description="Gambar kecil di sisi kanan slide tiga bagian."
            />
            <ImageUploader
              fieldName="right_peek_logo_url"
              label="Logo Peek Kanan (Opsional)"
              description="Logo yang akan muncul di peek kanan."
            />
            <FormField
              control={form.control}
              name="right_peek_alt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teks Alternatif Peek Kanan (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Deskripsi gambar peek kanan" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="right_peek_bg_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna Latar Belakang Peek Kanan (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="bg-purple-200 dark:bg-purple-950" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Kelas Tailwind CSS untuk warna latar belakang peek kanan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="right_peek_hashtag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtag Peek Kanan (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="#PROMOHEMAT" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Teks kecil di bawah peek kanan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
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