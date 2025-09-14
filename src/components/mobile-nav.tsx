"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, LayoutGrid, Loader2 } from "lucide-react"; // Menambahkan LayoutGrid dan Loader2

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppSettings } from "@/lib/supabase/app-settings";
import { getCategories, Category } from "@/lib/supabase/categories"; // Import getCategories dan Category
import { CategorySheet } from "./category-sheet"; // Import CategorySheet
import { useAdmin } from "@/hooks/use-admin"; // Import useAdmin
import { adminNavItems } from "@/config/admin-nav"; // Import adminNavItems
import { Separator } from "@/components/ui/separator"; // Import Separator

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]); // State untuk kategori
  const [isLoadingCategories, setIsLoadingCategories] = useState(true); // State loading kategori
  const { isAdmin, isAdminLoading } = useAdmin(); // Gunakan hook useAdmin

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

    const fetchCategoriesData = async () => {
      setIsLoadingCategories(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setIsLoadingCategories(false);
    };

    fetchAppSettings();
    fetchCategoriesData();
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
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/">Beranda</Link>
          </Button>
          {/* Tautan Kategori Dinamis */}
          <h3 className="text-sm font-semibold text-muted-foreground px-4 pt-2">Kategori</h3>
          {isLoadingCategories ? (
            <div className="px-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 w-full bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <>
              {categories.slice(0, 5).map((category) => ( // Tampilkan 5 kategori teratas
                <Button key={category.id} variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                  <Link href={`/category/${category.slug}`}>{category.name}</Link>
                </Button>
              ))}
              {categories.length > 0 && (
                <CategorySheet> {/* Menggunakan CategorySheet sebagai trigger */}
                  <Button variant="ghost" className="justify-start w-full flex items-center gap-2" onClick={() => setOpen(false)}>
                    <LayoutGrid className="h-5 w-5" />
                    <span>Semua Kategori</span>
                  </Button>
                </CategorySheet>
              )}
            </>
          )}
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/blog">Blog</Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/services">Layanan Servis</Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/contact">Kontak</Link>
          </Button>

          {/* Admin Dashboard Links (Conditional) */}
          {!isAdminLoading && isAdmin && (
            <>
              <Separator className="my-4" />
              <h3 className="text-sm font-semibold text-muted-foreground px-4 pt-2">Dasbor Admin</h3>
              {adminNavItems.map((item) => (
                <Button key={item.href} variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}