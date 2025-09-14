"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, User, Heart, Download, MessageSquare, Bell } from "lucide-react";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { UserNav } from "./user-nav";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSettings } from "@/lib/supabase/app-settings";
import { useCart } from "@/context/cart-context";
import { ChatNotificationIcon } from "./chat-notification-icon";
import { AdminChatNotificationIcon } from "./admin-chat-notification-icon";
import { useAdmin } from "@/hooks/use-admin";
import { useRouter } from "next/navigation";
import { CartSheet } from "./cart-sheet";
import { ChatWidget } from "./chat-widget";

export function Header() {
  const { session, isLoading: isAuthLoading, user } = useAuth();
  const { totalItems } = useCart();
  const { isAdmin } = useAdmin();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false);
  const router = useRouter();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 hidden md:block">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="flex space-x-4">
            {appSettings?.download_app_url && (
              <a href={appSettings.download_app_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                <Download className="h-3 w-3" /> {appSettings.download_app_text || "Download Aplikasi"}
              </a>
            )}
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">
              Bantuan
            </a>
            {appSettings?.right_header_text_enabled && appSettings?.right_header_text_content && (
              appSettings.right_header_text_link ? (
                <Link href={appSettings.right_header_text_link} className="hover:underline">
                  {appSettings.right_header_text_content}
                </Link>
              ) : (
                <span className="hover:underline">{appSettings.right_header_text_content}</span>
              )
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/" className="hidden md:flex items-center space-x-2">
            {appSettings?.site_logo_url ? (
              <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
            ) : (
              <span className="inline-block font-bold text-lg">{appSettings?.site_name || "Cellkom"}</span>
            )}
          </Link>
          <MainNav />
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center space-x-2">
            {appSettings?.site_logo_url ? (
              <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
            ) : (
              <span className="inline-block font-bold text-lg">{appSettings?.site_name || "Cellkom"}</span>
            )}
          </Link>
        </div>

        <div className="flex-1 max-w-xl hidden lg:block">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-700 border-none focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-10 rounded-full">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="sr-only">Cari</span>
            </Button>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => router.push(`/search`)}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Cari</span>
          </Button>

          {/* Always show Cart and Heart */}
          <CartSheet />
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Favorit</span>
          </Button>

          {isAuthLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            // Logged in: Show Chat, Bell, and UserNav dropdown
            <>
              {isAdmin ? (
                <AdminChatNotificationIcon />
              ) : (
                <ChatNotificationIcon />
              )}
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifikasi</span>
              </Button>
              <UserNav />
            </>
          ) : (
            // Not logged in: Show Masuk/Daftar buttons
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/auth">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">Daftar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      {appSettings?.scrolling_text_enabled && appSettings?.scrolling_text_content && (
        <div className="bg-primary text-primary-foreground text-sm py-1 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee">
            {appSettings.scrolling_text_content}
          </div>
        </div>
      )}
    </header>
  );
}