"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppSettings } from "@/lib/supabase/app-settings";
import { cn } from "@/lib/utils"; // Import cn for conditional classNames

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchAppSettings = async () => {
      setIsLoadingSettings(true);
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();

      if (error) {
        console.error("Error fetching app settings:", error.message);
      } else {
        setAppSettings(data);
      }
      setIsLoadingSettings(false);
    };

    fetchAppSettings();
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-start">
            {isLoadingSettings ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
            ) : appSettings?.site_logo_url ? (
              <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
            ) : (
              <span className="inline-block font-bold text-lg">{appSettings?.site_name || "Cellkom"}</span>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 py-4">
          <Button variant="ghost" className="justify-start hover:bg-transparent hover:underline" asChild onClick={() => setOpen(false)}>
            <Link href="/">Beranda</Link>
          </Button>
          <Button variant="ghost" className="justify-start hover:bg-transparent hover:underline" asChild onClick={() => setOpen(false)}>
            <Link href="/products">Produk</Link>
          </Button>
          <Button variant="ghost" className="justify-start hover:bg-transparent hover:underline" asChild onClick={() => setOpen(false)}>
            <Link href="/categories">Kategori</Link>
          </Button>
          <Button variant="ghost" className="justify-start hover:bg-transparent hover:underline" asChild onClick={() => setOpen(false)}>
            <Link href="/blog">Blog</Link>
          </Button>
          <Button variant="ghost" className="justify-start hover:bg-transparent hover:underline" asChild onClick={() => setOpen(false)}>
            <Link href="/about">Tentang Kami</Link>
          </Button>
          <Button variant="ghost" className="justify-start hover:bg-transparent hover:underline" asChild onClick={() => setOpen(false)}>
            <Link href="/contact">Kontak</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}