"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { Menu, LayoutGrid, Tag, Loader2 } from "lucide-react"; // Import LayoutGrid, Tag, Loader2
import * as LucideIcons from "lucide-react"; // Import all Lucide icons

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { supabase } from "@/integrations/supabase/client";
import { AppSettings } from "@/lib/supabase/app-settings";
import { getCategoriesWithLatestProductImage, Category } from "@/lib/supabase/categories"; // Import category utilities

// Helper function for icons, similar to CategorySheet
function CategoryIcon({ name }: { name: string | null }) {
  const Icon = (LucideIcons as any)[name as keyof typeof LucideIcons] || Tag;
  return <Icon className="h-6 w-6 text-muted-foreground" />;
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      const fetchedCategories = await getCategoriesWithLatestProductImage();
      setCategories(fetchedCategories);
      setIsLoadingCategories(false);
    };

    fetchAppSettings();
    fetchCategories();
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
      <SheetContent side="left" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pb-4 border-b">
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
        <ScrollArea className="flex-1">
          <div className="flex flex-col space-y-4 py-4 px-6">
            <h3 className="text-lg font-semibold text-foreground">Navigasi Utama</h3>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/">Beranda</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/new-arrivals">Produk Baru</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/contact">Kontak</Link>
            </Button>
          </div>

          <div className="px-6 py-4 border-t">
            <h3 className="text-lg font-semibold text-foreground mb-4">Kategori</h3>
            {isLoadingCategories ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Tidak ada kategori yang ditemukan.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex flex-col items-center justify-start space-y-2 text-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted relative overflow-hidden">
                      {category.latest_product_image_url ? (
                        <Image
                          src={category.latest_product_image_url}
                          alt={category.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 10vw, 5vw"
                        />
                      ) : (
                        <CategoryIcon name={category.icon_name} />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {category.name}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}