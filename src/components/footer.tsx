"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone } from 'lucide-react';
import { Separator } from './ui/separator';
import { getAppSettings, AppSettings } from '@/lib/supabase-queries'; // Import getAppSettings and AppSettings
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export function Footer() {
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);

  React.useEffect(() => {
    async function fetchSettings() {
      setIsLoadingSettings(true);
      const settings = await getAppSettings();
      setAppSettings(settings);
      setIsLoadingSettings(false);
    }
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Cellkom Store Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="text-2xl font-bold text-primary mb-4 block">
              {isLoadingSettings ? (
                <Skeleton className="h-10 w-40" />
              ) : appSettings?.site_logo_url ? (
                <Image
                  src={appSettings.site_logo_url}
                  alt={appSettings.site_name || "Cellkom Store Logo"}
                  width={150}
                  height={38}
                  className="h-auto"
                />
              ) : (
                appSettings?.site_name || "Cellkom Store"
              )}
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Toko online terpercaya untuk kebutuhan gadget, elektronik, fashion, dan lainnya.
            </p>
            <div className="flex space-x-3 mt-4">
              {isLoadingSettings ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-5 rounded-full" />)
              ) : (
                <>
                  {appSettings?.facebook_url && (
                    <a href={appSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {appSettings?.instagram_url && (
                    <a href={appSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {appSettings?.twitter_url && (
                    <a href={appSettings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {appSettings?.youtube_url && (
                    <a href={appSettings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                  {appSettings?.linkedin_url && (
                    <a href={appSettings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Kategori Populer Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Kategori Populer</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/handphone-tablet" className="text-muted-foreground hover:text-primary transition-colors">Handphone & Tablet</Link></li>
              <li><Link href="/category/komputer-laptop" className="text-muted-foreground hover:text-primary transition-colors">Komputer & Laptop</Link></li>
              <li><Link href="/category/pakaian-pria" className="text-muted-foreground hover:text-primary transition-colors">Pakaian Pria</Link></li>
              <li><Link href="/category/kesehatan-kecantikan" className="text-muted-foreground hover:text-primary transition-colors">Kesehatan & Kecantikan</Link></li>
              <li><Link href="/category/perhiasan-logam" className="text-muted-foreground hover:text-primary transition-colors">Perhiasan & Logam</Link></li>
            </ul>
          </div>

          {/* Layanan Pelanggan Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Layanan Pelanggan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Bantuan</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Cara Belanja</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Pengembalian Produk</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          {/* Tentang Kami Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Tentang Kami</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Karir</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Mitra</Link></li>
            </ul>
          </div>

          {/* Kontak Kami Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Kontak Kami</h3>
            <ul className="space-y-2 text-sm">
              {isLoadingSettings ? (
                <>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-4 w-52" />
                </>
              ) : (
                <>
                  {appSettings?.contact_email && (
                    <li className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{appSettings.contact_email}</span>
                    </li>
                  )}
                  {appSettings?.contact_phone && (
                    <li className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{appSettings.contact_phone}</span>
                    </li>
                  )}
                  {appSettings?.contact_address && (
                    <li className="text-muted-foreground">
                      {appSettings.contact_address}
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {appSettings?.site_name || "Cellkom Store"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}