"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone } from 'lucide-react';
import { Separator } from './ui/separator';
import { getAppSettings, AppSettings } from '@/lib/supabase/app-settings';
import { getCategories, Category } from '@/lib/supabase/categories';
import { Skeleton } from '@/components/ui/skeleton';
import FooterSectionUI from './ui/footer-section'; // New import

export function Footer() {
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);

  React.useEffect(() => {
    async function fetchSettingsAndCategories() {
      setIsLoadingSettings(true);
      const settings = await getAppSettings();
      setAppSettings(settings);

      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);

      setIsLoadingSettings(false);
    }
    fetchSettingsAndCategories();
  }, []);

  // Prepare menuItems for FooterSectionUI
  const menuItems = [
    {
      title: "Kategori Populer",
      links: categories.slice(0, 5).map(c => ({ text: c.name, url: `/category/${c.slug}` })),
    },
    {
      title: "Layanan Pelanggan",
      links: [
        { text: "Bantuan", url: "#" },
        { text: "Cara Belanja", url: "#" },
        { text: "Pengembalian Produk", url: "#" },
        { text: "Kebijakan Privasi", url: "#" },
        { text: "Syarat & Ketentuan", url: "#" },
      ],
    },
    {
      title: "Tentang Kami",
      links: [
        { text: "Karir", url: "#" },
        { text: "Blog", url: "/blog" },
        { text: "Mitra", url: "#" },
        { text: "Kontak Kami", url: "/contact" },
      ],
    },
    {
      title: "Kontak Kami", // This will be a list of contact info, not just links
      links: [
        ...(appSettings?.contact_email ? [{ text: appSettings.contact_email, url: `mailto:${appSettings.contact_email}` }] : []),
        ...(appSettings?.contact_phone ? [{ text: appSettings.contact_phone, url: `tel:${appSettings.contact_phone}` }] : []),
        ...(appSettings?.contact_address ? [{ text: appSettings.contact_address, url: "#" }] : []), // Address might not be a clickable link
      ].filter(Boolean), // Filter out null/undefined entries
    },
  ];

  // Prepare social links for the main branding section
  const socialLinks = [
    ...(appSettings?.facebook_url ? [{ icon: Facebook, url: appSettings.facebook_url }] : []),
    ...(appSettings?.instagram_url ? [{ icon: Instagram, url: appSettings.instagram_url }] : []),
    ...(appSettings?.twitter_url ? [{ icon: Twitter, url: appSettings.twitter_url }] : []),
    ...(appSettings?.youtube_url ? [{ icon: Youtube, url: appSettings.youtube_url }] : []),
    ...(appSettings?.linkedin_url ? [{ icon: Linkedin, url: appSettings.linkedin_url }] : []),
  ].filter(Boolean);

  const copyrightText = `© ${new Date().getFullYear()} ${appSettings?.site_name || "Cellkom Store"}. All rights reserved.`;
  const bottomLinks = [
    { text: "Kebijakan Privasi", url: "#" },
    { text: "Syarat & Ketentuan", url: "#" },
  ];

  if (isLoadingSettings) {
    return (
      <footer className="bg-gray-100 dark:bg-gray-900 border-t mt-12 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-10">
            <div className="max-w-sm text-center lg:text-left">
              <Skeleton className="h-12 w-12 mx-auto lg:mx-0 mb-4" />
              <Skeleton className="h-4 w-3/4 mx-auto lg:mx-0 mb-2" />
              <Skeleton className="h-4 w-full mx-auto lg:mx-0 mb-2" />
              <Skeleton className="h-4 w-5/6 mx-auto lg:mx-0" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 flex-1">
              {Array.from({ length: 4 }).map((_, sectionIdx) => (
                <div key={sectionIdx}>
                  <Skeleton className="h-5 w-24 mb-3" />
                  <ul className="space-y-2">
                    {Array.from({ length: 4 }).map((_, linkIdx) => (
                      <li key={linkIdx}><Skeleton className="h-4 w-32" /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 dark:text-gray-400 gap-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <FooterSectionUI
      logoSrc={appSettings?.site_logo_url || "/teslogocellkom.png"} // Use your default logo
      logoAlt={appSettings?.site_name || "Cellkom Store Logo"}
      aboutTitle={`Tentang ${appSettings?.site_name || "Cellkom Store"}`}
      aboutText="Cellkom Store adalah solusi total untuk gadget dan komputer Anda. Kami menyediakan produk berkualitas dan layanan terbaik."
      menuItems={menuItems}
      socialLinks={socialLinks} // Pass social links
      copyright={copyrightText}
      bottomLinks={bottomLinks}
    />
  );
}