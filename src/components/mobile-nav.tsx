"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image dari next/image
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"; // Hapus SheetTitle
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client"; // Import klien Supabase

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [siteLogoUrl, setSiteLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSiteSettings = async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("site_logo_url")
        .eq("id", "00000000-0000-0000-0000-000000000001") // Mengambil pengaturan dari ID yang diketahui
        .single();

      if (error) {
        console.error("Error fetching site settings:", error);
      } else if (data) {
        setSiteLogoUrl(data.site_logo_url);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle mobile navigation"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between px-1">
          {siteLogoUrl ? (
            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src={siteLogoUrl}
                alt="Site Logo"
                width={100} // Sesuaikan lebar sesuai kebutuhan
                height={40} // Sesuaikan tinggi sesuai kebutuhan
                className="h-10 w-auto" // Kelas Tailwind untuk ukuran responsif
                priority // Memprioritaskan pemuatan gambar ini
              />
            </Link>
          ) : (
            // Placeholder atau teks default jika logo tidak dimuat
            <Link href="/" onClick={() => setOpen(false)} className="text-lg font-bold">
              Your App
            </Link>
          )}
          {/* Teks "Navigasi" telah dihapus */}
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-4 py-4">
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/products">Products</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/categories">Categories</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/blog">Blog</Link>
            </Button>
            <Separator />
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/profile">Profile</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}