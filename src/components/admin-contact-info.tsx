"use client";

import * as React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin, Loader2 } from "lucide-react";
import { getAppSettings, AppSettings } from "@/lib/supabase/app-settings";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminContactInfo() {
  const [settings, setSettings] = React.useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const data = await getAppSettings();
      setSettings(data);
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Hubungi Kami</DialogTitle>
        <DialogDescription>
          Informasi kontak untuk dukungan dan pertanyaan.
        </DialogDescription>
      </DialogHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Memuat kontak...</span>
        </div>
      ) : settings ? (
        <div className="grid gap-4 py-4">
          {settings.contact_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <Link href={`tel:${settings.contact_phone}`} className="text-base hover:underline">
                {settings.contact_phone}
              </Link>
            </div>
          )}
          {settings.contact_email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <Link href={`mailto:${settings.contact_email}`} className="text-base hover:underline">
                {settings.contact_email}
              </Link>
            </div>
          )}
          {settings.contact_address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <p className="text-base">{settings.contact_address}</p>
            </div>
          )}

          {(settings.facebook_url || settings.instagram_url || settings.twitter_url || settings.youtube_url || settings.linkedin_url) && (
            <>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Ikuti Kami:</p>
                <div className="flex gap-3">
                  {settings.facebook_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-5 w-5" />
                        <span className="sr-only">Facebook</span>
                      </Link>
                    </Button>
                  )}
                  {settings.instagram_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                      </Link>
                    </Button>
                  )}
                  {settings.twitter_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={settings.twitter_url} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </Link>
                    </Button>
                  )}
                  {settings.youtube_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={settings.youtube_url} target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-5 w-5" />
                        <span className="sr-only">YouTube</span>
                      </Link>
                    </Button>
                  )}
                  {settings.linkedin_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={settings.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Mail className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Informasi kontak tidak tersedia saat ini.</p>
          <p className="text-sm text-muted-foreground">Silakan coba lagi nanti.</p>
        </div>
      )}
    </DialogContent>
  );
}