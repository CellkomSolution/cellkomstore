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
import { getAppSettings, updateAppSettings, AppSettings } from "@/lib/supabase-queries";
import { ImageUploader } from "@/components/image-uploader"; // Import ImageUploader

const formSchema = z.object({
  site_name: z.string().min(1, { message: "Nama situs tidak boleh kosong." }),
  site_logo_url: z.string().url({ message: "URL logo tidak valid." }).nullable().optional(),
  contact_email: z.string().email({ message: "Email tidak valid." }).nullable().optional().or(z.literal("")),
  contact_phone: z.string().nullable().optional().or(z.literal("")),
  contact_address: z.string().nullable().optional().or(z.literal("")),
  facebook_url: z.string().url({ message: "URL Facebook tidak valid." }).nullable().optional().or(z.literal("")),
  instagram_url: z.string().url({ message: "URL Instagram tidak valid." }).nullable().optional().or(z.literal("")),
  twitter_url: z.string().url({ message: "URL Twitter tidak valid." }).nullable().optional().or(z.literal("")),
  youtube_url: z.string().url({ message: "URL YouTube tidak valid." }).nullable().optional().or(z.literal("")),
  linkedin_url: z.string().url({ message: "URL LinkedIn tidak valid." }).nullable().optional().or(z.literal("")),
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
    },
  });

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const settings = await getAppSettings();
      if (settings) {
        setInitialData(settings);
        form.reset({
          site_name: settings.site_name,
          site_logo_url: settings.site_logo_url,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          contact_address: settings.contact_address,
          facebook_url: settings.facebook_url,
          instagram_url: settings.instagram_url,
          twitter_url: settings.twitter_url,
          youtube_url: settings.youtube_url,
          linkedin_url: settings.linkedin_url,
        });
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await updateAppSettings(values);
      toast.success("Pengaturan berhasil diperbarui!");
    } catch (error: any) {
      toast.error("Gagal memperbarui pengaturan: " + error.message);
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
                      <Input placeholder="Nama Toko Anda" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nama yang akan ditampilkan di header, footer, dan judul halaman.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Logo Situs</FormLabel>
                <FormControl>
                  <ImageUploader
                    bucketName="app-assets" // Anda mungkin perlu membuat bucket ini di Supabase Storage
                    currentImageUrl={form.watch("site_logo_url")}
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