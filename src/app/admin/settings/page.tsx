"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAppSettings, updateAppSettings, AppSettings } from "@/lib/supabase/app-settings";
import { GeneralSettingsForm } from "@/components/admin/settings/general-settings-form";
import { ContactSocialSettingsForm } from "@/components/admin/settings/contact-social-settings-form";
import { HeaderFooterSettingsForm } from "@/components/admin/settings/header-footer-settings-form";
import { FeaturedBrandsSettingsForm } from "@/components/admin/settings/featured-brands-settings-form";

const formSchema = z.object({
  site_name: z.string().nullable().default(null),
  site_logo_url: z.string().url({ message: "URL logo tidak valid." }).nullable().default(null),
  contact_email: z.string().email({ message: "Email tidak valid." }).nullable().default(null),
  contact_phone: z.string().nullable().default(null),
  contact_address: z.string().nullable().default(null),
  facebook_url: z.string().url({ message: "URL Facebook tidak valid." }).nullable().default(null),
  instagram_url: z.string().url({ message: "URL Instagram tidak valid." }).nullable().default(null),
  twitter_url: z.string().url({ message: "URL Twitter tidak valid." }).nullable().default(null),
  youtube_url: z.string().url({ message: "URL YouTube tidak valid." }).nullable().default(null),
  linkedin_url: z.string().url({ message: "URL LinkedIn tidak valid." }).nullable().default(null),
  scrolling_text_enabled: z.boolean().nullable().default(false), // Changed to .nullable()
  scrolling_text_content: z.string().nullable().default(null),
  right_header_text_enabled: z.boolean().nullable().default(false), // Changed to .nullable()
  right_header_text_content: z.string().nullable().default(null),
  right_header_text_link: z.string().url({ message: "URL tautan tidak valid." }).nullable().default(null),
  download_app_url: z.string().url({ message: "URL unduhan aplikasi tidak valid." }).nullable().default(null),
  download_app_text: z.string().nullable().default(null),
  featured_brands_title: z.string().nullable().default(null),
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
  if (data.download_app_url && (!data.download_app_text || data.download_app_text.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Teks unduhan aplikasi tidak boleh kosong jika URL diaktifkan.",
      path: ['download_app_text'],
    });
  }
});

// Derive the form values type directly from the schema
export type SettingsFormValues = z.infer<typeof formSchema>;

export default function AdminSettingsPage() {
  const [initialData, setInitialData] = React.useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: null,
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
      download_app_url: null,
      download_app_text: null,
      featured_brands_title: null,
    },
  });

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const settings = await getAppSettings();
      if (settings) {
        setInitialData(settings);
        form.reset({
          site_name: settings.site_name || null,
          site_logo_url: settings.site_logo_url || null,
          contact_email: settings.contact_email || null,
          contact_phone: settings.contact_phone || null,
          contact_address: settings.contact_address || null,
          facebook_url: settings.facebook_url || null,
          instagram_url: settings.instagram_url || null,
          twitter_url: settings.twitter_url || null,
          youtube_url: settings.youtube_url || null,
          linkedin_url: settings.linkedin_url || null,
          scrolling_text_enabled: settings.scrolling_text_enabled || false,
          scrolling_text_content: settings.scrolling_text_content || null,
          right_header_text_enabled: settings.right_header_text_enabled || false,
          right_header_text_content: settings.right_header_text_content || null,
          right_header_text_link: settings.right_header_text_link || null,
          download_app_url: settings.download_app_url || null,
          download_app_text: settings.download_app_text || null,
          featured_brands_title: settings.featured_brands_title || null,
        });
      } else {
        // If no settings, ensure form is reset to schema defaults
        form.reset({
          site_name: null,
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
          download_app_url: null,
          download_app_text: null,
          featured_brands_title: null,
        });
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, [form]);

  const onSubmit: SubmitHandler<SettingsFormValues> = async (values) => {
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

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
            </CardHeader>
            <CardContent>
              <GeneralSettingsForm isSubmitting={isSubmitting} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontak & Media Sosial</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactSocialSettingsForm isSubmitting={isSubmitting} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Header & Aplikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <HeaderFooterSettingsForm isSubmitting={isSubmitting} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Merek Unggulan</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedBrandsSettingsForm isSubmitting={isSubmitting} />
            </CardContent>
          </Card>

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
      </FormProvider>
    </div>
  );
}