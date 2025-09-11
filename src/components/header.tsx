"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, LayoutGrid, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartSheet } from "./cart-sheet";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { UserAuthNav } from "./user-auth-nav";
import { getAppSettings, AppSettings } from "@/lib/supabase/app-settings"; // Import dari modul app-settings
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();
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

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="flex space-x-4">
            <a href="#" className="hover:underline flex items-center gap-1">
              <Download className="h-3 w-3" /> Download Aplikasi Cellkom
            </a>
            <a href="#" className="hover:underline">CellkomCare</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Jual di Cellkom Store</a>
            <a href="#" className="hover:underline">Cellkom Ticket Rewards</a>
            <a href="#" className="hover:underline">Cek daftar pesanan</a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              {isLoadingSettings ? (
                <Skeleton className="h-8 w-32" />
              ) : appSettings?.site_logo_url ? (
                <Image
                  src={appSettings.site_logo_url}
                  alt={appSettings.site_name || "Cellkom Store Logo"}
                  width={120}
                  height={30}
                  className="h-auto"
                />
              ) : (
                appSettings?.site_name || "Cellkom Store"
              )}
            </Link>
            <Button variant="ghost" className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
              <LayoutGrid className="h-5 w-5" />
              <span>Kategori</span>
            </Button>
          </div>

          <div className="flex-1 max-w-xl hidden sm:flex">
            <form onSubmit={handleSearchSubmit} className="relative flex w-full">
              <Input
                type="search"
                placeholder="Cari produk impianmu..."
                className="flex-1 rounded-r-none pr-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="rounded-l-none px-4">
                <Search className="h-5 w-5" />
                <span className="sr-only">Cari</span>
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <CartSheet />
            <UserAuthNav />
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-2 sm:hidden">
            <form onSubmit={handleSearchSubmit} className="relative flex w-full">
              <Input
                type="search"
                placeholder="Cari produk di sini..."
                className="flex-1 rounded-r-none pr-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="rounded-l-none px-4">
                <Search className="h-5 w-5" />
                <span className="sr-only">Cari</span>
              </Button>
            </form>
        </div>
      </div>

      <div className="bg-background border-t text-xs text-muted-foreground">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap pb-1">
            <Link href="#" className="hover:underline">Serbu Sale Disc 63%</Link>
            <Link href="#" className="hover:underline">DEKORUMA DISC 60%+20%</Link>
            <Link href="#" className="hover:underline">DREAMBOX DISC SD 1JT</Link>
            <Link href="#" className="hover:underline">Hydro Flask x Syma</Link>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <MapPin className="h-4 w-4" />
            <span>Tambah alamat biar belanja lebih asyik</span>
            <Menu className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>
    </header>
  );
}