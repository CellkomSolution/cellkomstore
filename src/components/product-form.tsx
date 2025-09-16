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
import { Product } from "@/lib/supabase/products"; // Import Product dari modul products
import { getCategories, Category } from "@/lib/supabase/categories"; // Import getCategories, Category dari modul categories

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama produk minimal 3 karakter." }),
  price: z.coerce.number().min(0, { message: "Harga tidak boleh negatif." }),
  originalPrice: z.coerce.number().min(0, { message: "Harga asli tidak boleh negatif." }).optional().or(z.literal(0)),
  category: z.string().min(1, { message: "Kategori harus dipilih." }),
  location: z.string().min(3, { message: "Lokasi minimal 3 karakter." }),
  description: z.string().min(10, { message: "Deskripsi minimal 10 karakter." }),
  isFlashSale: z.boolean().default(false).optional(),
  imageUrl: z.string().url({ message: "URL gambar tidak valid." }).optional().or(z.literal("")),
  imageFile: z.any().optional(), // For file upload
});

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  loading?: boolean;
}

export function ProductForm({ initialData, onSubmit, loading = false }: ProductFormProps) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.imageUrl || null);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setIsLoadingCategories(false);
    }
    fetchCategories();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      originalPrice: initialData?.originalPrice || 0,
      category: initialData?.category || "",
      location: initialData?.location || "",
      description: initialData?.description || "",
      isFlashSale: initialData?.isFlashSale || false,
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Tidak bisa mendapatkan URL publik untuk gambar.");
      }

      setImagePreview(publicUrlData.publicUrl);
      form.setValue("imageUrl", publicUrlData.publicUrl, { shouldValidate: true });
      toast.success("Gambar berhasil diunggah!");
    } catch (error: any) {
      toast.error("Gagal mengunggah gambar: " + error.message);
      setImagePreview(null);
      form.setValue("imageUrl", "");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("imageUrl", "");
    form.setValue("imageFile", undefined);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Produk</FormLabel>
              <FormControl>
                <Input placeholder="Nama produk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Asli (Opsional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormDescription>
                  Isi jika ada diskon.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCategories ? "Memuat kategori..." : "Pilih kategori"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi</FormLabel>
              <FormControl>
                <Input placeholder="Jakarta" {...field} />
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
              <FormLabel>Deskripsi Produk</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis deskripsi lengkap produk di sini..."
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isFlashSale"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Flash Sale</FormLabel>
                <FormDescription>
                  Aktifkan jika produk ini termasuk dalam promosi flash sale.
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
        <FormItem>
          <FormLabel>Gambar Produk</FormLabel>
          <FormControl>
            <div>
              {imagePreview ? (
                <div className="relative h-48 w-full max-w-md">
                  <Image
                    src={imagePreview}
                    alt="Product Preview"
                    fill
                    style={{ objectFit: "contain" }}
                    className="p-2 border rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full h-6 w-6"
                    onClick={removeImage}
                    disabled={loading || isUploadingImage}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Hapus Gambar</span>
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={loading || isUploadingImage}
                  />
                  {isUploadingImage ? (
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
          <FormDescription>
            Unggah gambar utama untuk produk Anda.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <Button type="submit" disabled={loading || isUploadingImage}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? "Simpan Perubahan" : "Buat Produk"
          )}
        </Button>
      </form>
    </Form>
  );
}