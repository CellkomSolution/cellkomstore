"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, User, Download, MessageSquare } from "lucide-react"; // Removed Bell
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
import { CategorySheet } from "./category-sheet"; // Import CategorySheet

export function Header() {
  const { session, isLoading: isAuthLoading, user } = useAuth();
  const { totalItems } = useCart();
  const { isAdmin } = useAdmin();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // State for MobileNav
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false); // State for CategorySheet
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

  const handleOpenCategorySheet = () => {
    setIsMobileNavOpen(false); // Close MobileNav first
    // Introduce a small delay before opening CategorySheet
    setTimeout(() => {
      setIsCategorySheetOpen(true); // Then open CategorySheet
    }, 100); // 100ms delay
  };

  const showScrollingText = (appSettings?.scrolling_text_enabled && appSettings?.scrolling_text_content) || (appSettings?.store_status_enabled && appSettings?.store_status_content);

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
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Mobile-only Logo and Search Row */}
        <div className="md:hidden w-full flex items-center gap-2 mb-2">
          <Link href="/" className="flex items-center space-x-2">
            {appSettings?.site_logo_url ? (
              <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
            ) : (
              <span className="inline-block font-bold text-lg">{appSettings?.site_name || "Cellkom"}</span>
            )}
          </Link>
          <form onSubmit={handleSearch} className="relative flex-1">
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

        {/* Main Header Content Row (adapts for mobile/desktop) */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          {/* Left side: MobileNav (always visible on mobile), DesktopNav (hidden on mobile) */}
          <div className="flex items-center gap-4">
            <MobileNav 
              open={isMobileNavOpen} 
              onOpenChange={setIsMobileNavOpen} 
              onOpenCategorySheet={handleOpenCategorySheet} 
            /> {/* Mobile menu button */}
            <Link href="/" className="hidden md:flex items-center space-x-2">
              {/* Desktop Logo */}
              {appSettings?.site_logo_url ? (
                <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
              ) : (
                <span className="inline-block font-bold text-lg">{appSettings?.site_name || "Cellkom"}</span>
              )}
            </Link>
            <MainNav /> {/* Desktop navigation links */}
          </div>

          {/* Center: Desktop Search (hidden on mobile) */}
          <div className="flex-1 max-w-xl hidden md:block">
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

          {/* Right side: Conditional Icons (Chat), Cart, UserNav/Auth */}
          <div className="flex items-center space-x-4">
            {isAuthLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              // Logged in: Show Chat icon
              <>
                {isAdmin ? (
                  <AdminChatNotificationIcon />
                ) : (
                  <ChatNotificationIcon />
                )}
              </>
            ) : null} {/* No chat icons if not logged in */}

            <CartSheet /> {/* Cart is always visible */}

            {isAuthLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <UserNav />
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
      </div>
      {showScrollingText && (
        <div className="bg-primary text-primary-foreground text-sm py-1 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex items-center">
            {appSettings?.scrolling_text_enabled && appSettings?.scrolling_text_content && (
              <span>{appSettings.scrolling_text_content}</span>
            )}
            {(appSettings?.scrolling_text_enabled && appSettings?.scrolling_text_content && appSettings?.store_status_enabled && appSettings?.store_status_content) && (
              <span className="mx-8">|</span>
            )}
            {appSettings?.store_status_enabled && appSettings?.store_status_content && (
              <span>{appSettings.store_status_content}</span>
            )}
          </div>
        </div>
      )}
      {/* Render CategorySheet here, controlled by Header's state */}
      <CategorySheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen} />
    </header>
  );
}