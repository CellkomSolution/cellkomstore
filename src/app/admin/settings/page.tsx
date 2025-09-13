"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAppSettings, updateAppSettings, AppSettings } from "@/lib/supabase/app-settings";
import { ImageUploader } from "@/components/image-uploader";
import { Switch } from "@/components/ui/switch"; // Import Switch component

const formSchema = z.object({
  site_name: z.string().nullable().optional().or(z.literal("")),
  site_logo_url: z.string().url({ message: "URL logo tidak valid." }).nullable().optional(),
  contact_email: z.string().email({ message: "Email tidak valid." }).nullable().optional().or(z.literal("")),
  contact_phone: z.string().nullable().optional().or(z.literal("")),
  contact_address: z.string().nullable().optional().or(z.literal("")),
  facebook_url: z.string().url({ message: "URL Facebook tidak valid." }).nullable().optional().or(z.literal("")),
  instagram_url: z.string().url({ message: "URL Instagram tidak valid." }).nullable().optional().or(z.literal("")),
  twitter_url: z.string().url({ message: "URL Twitter tidak valid." }).nullable().optional().or(z.literal("")),
  youtube_url: z.string().url({ message: "URL YouTube tidak valid." }).nullable().optional().or(z.literal("")),
  linkedin_url: z.string().url({ message: "URL LinkedIn tidak valid." }).nullable().optional().or(z.literal("")),
  scrolling_text_enabled: z.boolean().optional().default(false),
  scrolling_text_content: z.string().nullable().optional().or(z.literal("")),
  right_header_text_enabled: z.boolean().optional().default(false),
  right_header_text_content: z.string().nullable().optional().or(z.literal("")),
  right_header_text_link: z.string().url({ message: "URL tautan tidak valid." }).nullable().optional().or(z.literal("")),
  download_app_url: z.string().url({ message: "URL unduhan aplikasi tidak valid." }).nullable().optional().or(z.literal("")), // New field
}).superRefine((data, ctx) => {
  if (data.scrolling_text_enabled && (!data.scrolling_text_content || data.scrolling_text_content.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konten teks berjalan tidak boleh kosong jika diaktifkan.",
      path: ['scrolling_text_content'],
    });
  }
  if (data.right_header_text_enabled && (!data.right_header_text_content || data.right_header_text_content.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konten teks kanan header tidak boleh kosong jika diaktifkan.",
      path: ['right_header_text_content'],
    });
  }
});

export default function AdminSettingsPage() {
  const [initialData, setInitialData] = React.useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: "",
      site_logo_url: null,
      contact_email: null,
      contact_phone: null,
      contact_address: null,
      facebook_url: null,
      instagram_url: null,
      twitter_url: null,
      youtube_url: null,
      linkedin_url: null,
      scrolling_text_enabled: false,
      scrolling_text_content: null,
      right_header_text_enabled: false,
      right_header_text_content: null,
      right_header_text_link: null,
      download_app_url: null, // Default value for new field
    },
  });

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const settings = await getAppSettings();
      if (settings) {
        setInitialData(settings);
        form.reset({
          site_name: settings.site_name || "",
          site_logo_url: settings.site_logo_url,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          contact_address: settings.contact_address,
          facebook_url: settings.facebook_url,
          instagram_url: settings.instagram_url,
          twitter_url: settings.twitter_url,
          youtube_url: settings.youtube_url,
          linkedin_url: settings.linkedin_url,
          scrolling_text_enabled: settings.scrolling_text_enabled || false,
          scrolling_text_content: settings.scrolling_text_content || null,
          right_header_text_enabled: settings.right_header_text_enabled || false,
          right_header_text_content: settings.right_header_text_content || null,
          right_header_text_link: settings.right_header_text_link || null,
          download_app_url: settings.download_app_url || null, // Set value for new field
        });
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("onSubmit called with values:", values);
    setIsSubmitting(true);
    try {
      const processedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          typeof value === 'string' && value.trim() === '' ? null : value,
        ])
      ) as Partial<Omit<AppSettings, 'id' | 'created_at'>>;

      console.log("Submitting with processed values:", processedValues);

      await updateAppSettings(processedValues);
      toast.success("Pengaturan berhasil diperbarui!");
    } catch (error: any) {
      console.error("Error during settings update:", error);
      toast.error("Gagal memperbarui pengaturan: " + (error.message || "Terjadi kesalahan tidak dikenal."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUploadSuccess = (newUrl: string) => {
    form.setValue("site_logo_url", newUrl, { shouldValidate: true });
  };

  const handleRemoveLogo = () => {
    form.setValue("site_logo_url", null, { shouldValidate: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-8">
        <h2 className="text-2xl font-bold">Memuat Pengaturan...</h2>
        <Card>
          <CardHeader><CardTitle><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Memuat...</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
              <div className="h-48 w-full bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold">Pengaturan Aplikasi</h2>
      <p className="text-muted-foreground">
        Kelola pengaturan umum aplikasi Anda di sini, termasuk nama situs, logo, dan informasi kontak.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="site_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Situs</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Toko Anda" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>
                      Nama yang akan ditampilkan di header, footer, dan judul halaman. Jika kosong, akan menggunakan nama default.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Logo Situs</FormLabel>
                <FormControl>
                  <ImageUploader
                    bucketName="app-assets"
                    currentImageUrl={form.watch("site_logo_url") ?? null}
                    onUploadSuccess={handleLogoUploadSuccess}
                    onRemove={handleRemoveLogo}
                    disabled={isSubmitting}
                    aspectRatio="aspect-video"
                    className="max-w-xs"
                  />
                </FormControl>
                <FormDescription>
                  Unggah logo utama situs Anda.
                </FormDescription>
                <FormMessage />
              </FormItem>

              <h3 className="text-lg font-semibold mt-8">Informasi Kontak</h3>
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Kontak</FormLabel>
                    <FormControl>
                      <Input placeholder="support@example.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon Kontak</FormLabel>
                    <FormControl>
                      <Input placeholder="+62 812 3456 7890" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Kontak</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Jl. Contoh No. 123, Kota, Negara" className="resize-y min-h-[80px]" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="text-lg font-semibold mt-8">Tautan Media Sosial</h3>
              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/yourpage" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/yourpage" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitter_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/yourpage" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/yourchannel" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="text-lg font-semibold mt-8">Pengaturan Header Bawah</h3>
              <FormField
                control={form.control}
                name="scrolling_text_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktifkan Teks Berjalan</FormLabel>
                      <FormDescription>
                        Tampilkan teks yang bergerak di bagian kiri bawah header.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("scrolling_text_enabled") && (
                <FormField
                  control={form.control}
                  name="scrolling_text_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konten Teks Berjalan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Promo Spesial Akhir Tahun! Diskon hingga 50%!" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        Teks yang akan ditampilkan dan bergerak.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="right_header_text_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktifkan Teks Kanan Header</FormLabel>
                      <FormDescription>
                        Tampilkan teks atau tautan di bagian kanan bawah header.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("right_header_text_enabled") && (
                <>
                  <FormField
                    control={form.control}
                    name="right_header_text_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konten Teks Kanan Header</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Cek Promo Terbaru!" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormDescription>
                          Teks yang akan ditampilkan di sisi kanan.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="right_header_text_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Tautan Teks Kanan (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://cellkom.com/promo" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormDescription>
                          Jika diisi, teks akan menjadi tautan yang dapat diklik.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <h3 className="text-lg font-semibold mt-8">Pengaturan Aplikasi</h3>
              <FormField
                control={form.control}
                name="download_app_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Unduhan Aplikasi</FormLabel>
                    <FormControl>
                      <Input placeholder="https://play.google.com/store/apps/details?id=com.example.app" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>
                      Tautan untuk mengunduh aplikasi seluler Anda (misalnya, dari Play Store atau App Store).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Pengaturan"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}