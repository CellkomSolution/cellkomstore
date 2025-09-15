"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, LayoutGrid, Loader2, Tag, X } from "lucide-react";
import Image from "next/image";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppSettings } from "@/lib/supabase/app-settings";
import { getCategories, Category } from "@/lib/supabase/categories";
import { CategorySheet } from "./category-sheet";
import { useAdmin } from "@/hooks/use-admin";
import { adminNavItems } from "@/config/admin-nav";
import { Separator } from "@/components/ui/separator";
import { icons } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Helper component for category icon (similar to CategoryIcons.tsx)
function CategoryIcon({ name }: { name: string | null }) {
  const Icon = icons[name as keyof typeof icons] || Tag;
  return <Icon className="h-5 w-5 text-muted-foreground" />;
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { isAdmin, isAdminLoading } = useAdmin();

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
        <ScrollArea className="flex-1 py-4">
          <div className="flex flex-col space-y-1 pr-4">
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/">Beranda</Link>
            </Button>
            <h3 className="text-sm font-semibold text-muted-foreground px-4 pt-2">Kategori</h3>
            {isLoadingCategories ? (
              <div className="px-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 w-full bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <>
                {categories.slice(0, 5).map((category) => (
                  <Button key={category.id} variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                    <Link href={`/category/${category.slug}`} className="flex items-center gap-2">
                      {category.latest_product_image_url ? (
                        <div className="relative h-5 w-5 rounded-sm overflow-hidden">
                          <Image src={category.latest_product_image_url} alt={category.name} fill style={{ objectFit: 'cover' }} sizes="20px" />
                        </div>
                      ) : (
                        <CategoryIcon name={category.icon_name} />
                      )}
                      <span>{category.name}</span>
                    </Link>
                  </Button>
                ))}
                {categories.length > 0 && (
                  <CategorySheet open={open} onOpenChange={setOpen}>
                    <Button variant="ghost" className="justify-start">
                      <LayoutGrid className="mr-2 h-4 w-4" />
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}