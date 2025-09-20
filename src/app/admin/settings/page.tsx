"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAppSettings, updateAppSettings, AppSettings } from "@/lib/supabase/app-settings";
import { GeneralSettingsForm } from "@/components/admin/settings/general-settings-form";
import { ContactSocialSettingsForm } from "@/components/admin/settings/contact-social-settings-form";
import { HeaderFooterSettingsForm } from "@/components/admin/settings/header-footer-settings-form";
import { FeaturedBrandsSettingsForm } from "@/components/admin/settings/featured-brands-settings-form";
import { settingsFormSchema, SettingsFormValues } from "@/lib/types/app-settings"; // Import from new file

export default function AdminSettingsPage() {
  const [initialData, setInitialData] = React.useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema), // Use imported schema
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
      store_status_enabled: false,
      store_status_content: null,
    } as SettingsFormValues, // Explicitly cast defaultValues

  });

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const settings = await getAppSettings();
      if (settings) {
        setInitialData(settings);
        form.reset({
          site_name: settings.site_name ?? null,
          site_logo_url: settings.site_logo_url ?? null,
          contact_email: settings.contact_email ?? null,
          contact_phone: settings.contact_phone ?? null,
          contact_address: settings.contact_address ?? null,
          facebook_url: settings.facebook_url ?? null,
          instagram_url: settings.instagram_url ?? null,
          twitter_url: settings.twitter_url ?? null,
          youtube_url: settings.youtube_url ?? null,
          linkedin_url: settings.linkedin_url ?? null,
          scrolling_text_enabled: settings.scrolling_text_enabled ?? false,
          scrolling_text_content: settings.scrolling_text_content ?? null,
          right_header_text_enabled: settings.right_header_text_enabled ?? false,
          right_header_text_content: settings.right_header_text_content ?? null,
          right_header_text_link: settings.right_header_text_link ?? null,
          download_app_url: settings.download_app_url ?? null,
          download_app_text: settings.download_app_text ?? null,
          featured_brands_title: settings.featured_brands_title ?? null,
          store_status_enabled: settings.store_status_enabled ?? false,
          store_status_content: settings.store_status_content ?? null,
        } as SettingsFormValues); // Explicitly cast reset values
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
          store_status_enabled: false,
          store_status_content: null,
        } as SettingsFormValues); // Explicitly cast reset values
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