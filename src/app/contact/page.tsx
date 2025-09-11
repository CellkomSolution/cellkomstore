"use client";

import * as React from "react";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSettings, AppSettings } from "@/lib/supabase/app-settings"; // Import dari modul app-settings
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactPage() {
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const settings = await getAppSettings();
      setAppSettings(settings);
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Memuat Informasi Kontak...</h1>
        <Card className="max-w-2xl mx-auto">
          <CardHeader><CardTitle><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Memuat...</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <div className="flex space-x-3 mt-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-8 rounded-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Kontak Kami</h1>
      <p className="text-center text-muted-foreground mb-8">
        Kami siap membantu Anda! Hubungi kami melalui informasi di bawah ini.
      </p>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informasi Kontak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appSettings?.contact_email && (
            <div className="flex items-center gap-3 text-lg">
              <Mail className="h-6 w-6 text-primary" />
              <a href={`mailto:${appSettings.contact_email}`} className="hover:underline">
                {appSettings.contact_email}
              </a>
            </div>
          )}
          {appSettings?.contact_phone && (
            <div className="flex items-center gap-3 text-lg">
              <Phone className="h-6 w-6 text-primary" />
              <a href={`tel:${appSettings.contact_phone}`} className="hover:underline">
                {appSettings.contact_phone}
              </a>
            </div>
          )}
          {appSettings?.contact_address && (
            <div className="flex items-start gap-3 text-lg">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <p>{appSettings.contact_address}</p>
            </div>
          )}

          {(appSettings?.facebook_url || appSettings?.instagram_url || appSettings?.twitter_url || appSettings?.youtube_url || appSettings?.linkedin_url) && (
            <div className="pt-4 border-t mt-4">
              <h3 className="font-semibold text-foreground mb-3">Ikuti Kami</h3>
              <div className="flex space-x-4">
                {appSettings?.facebook_url && (
                  <a href={appSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {appSettings?.instagram_url && (
                  <a href={appSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {appSettings?.twitter_url && (
                  <a href={appSettings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
                {appSettings?.youtube_url && (
                  <a href={appSettings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
                {appSettings?.linkedin_url && (
                  <a href={appSettings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          )}

          {!appSettings?.contact_email && !appSettings?.contact_phone && !appSettings?.contact_address && !(appSettings?.facebook_url || appSettings?.instagram_url || appSettings?.twitter_url || appSettings?.youtube_url || appSettings?.linkedin_url) && (
            <p className="text-muted-foreground text-center">
              Informasi kontak belum diatur. Silakan tambahkan di halaman pengaturan admin.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}