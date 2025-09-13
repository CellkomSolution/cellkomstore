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
import { useCart } from "@/context/cart-context"; // Import useCart
import { ChatNotificationIcon } from "./chat-notification-icon"; // Import ChatNotificationIcon
import { AdminChatNotificationIcon } from "./admin-chat-notification-icon"; // Import AdminChatNotificationIcon
import { useAdmin } from "@/hooks/use-admin"; // Import useAdmin

export function Header() {
  const { session, isLoading: isAuthLoading, user } = useAuth();
  const { totalItems } = useCart(); // Dapatkan totalItems dari useCart
  const { isAdmin } = useAdmin(); // Dapatkan status admin
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
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="flex space-x-4">
            <a href="#" className="hover:underline flex items-center gap-1">
              <Download className="h-3 w-3" /> Download Aplikasi Cellkom
            </a>
          </div>
          <div className="flex space-x-4">
            {/* <a href="#" className="hover:underline">
              Jual di Cellkom
            </a>
            <a href="#" className="hover:underline">
              Cellkom Ticket Reward
            </a> */}
            <a href="#" className="hover:underline">
              Bantuan
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/" className="flex items-center space-x-2">
            {appSettings?.site_logo_url ? (
              <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
            ) : (
              <span className="inline-block font-bold text-lg">{appSettings?.site_name || "Cellkom"}</span>
            )}
          </Link>
          <MainNav />
        </div>

        <div className="flex-1 max-w-xl hidden lg:block">
          <div className="relative">
            <Input
              type="search"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-700 border-none focus-visible:ring-0"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && ( // Tampilkan badge hanya jika ada item
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-1 text-xs text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          {user && isAdmin ? (
            <AdminChatNotificationIcon />
          ) : user && !isAdmin ? (
            <ChatNotificationIcon />
          ) : (
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          {isAuthLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <UserNav />
          ) : (
            <Link href="/auth"> {/* Perbaiki tautan ke /auth */}
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
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
      {appSettings?.right_header_text_enabled && appSettings?.right_header_text_content && (
        <div className="bg-secondary text-secondary-foreground text-sm py-1 text-center">
          {appSettings.right_header_text_link ? (
            <Link href={appSettings.right_header_text_link} className="hover:underline">
              {appSettings.right_header_text_content}
            </Link>
          ) : (
            appSettings.right_header_text_content
          )}
        </div>
      )}
    </header>
  );
}