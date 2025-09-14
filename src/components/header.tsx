"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, User, Menu, X, Home, Package, MessageSquare, Settings, LogOut, ChevronRight, Heart, History, CreditCard, MapPin, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/cart-context";
import { useSession } from "@/context/session-context";
import { useRouter } from "next/navigation";
import { getAppSettings, AppSettings } from "@/lib/supabase/app-settings";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile

export function Header() {
  const { cartItems } = useCart();
  const { user, profile, signOut } = useSession();
  const router = useRouter();
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isMobile = useIsMobile(); // Gunakan hook useIsMobile

  React.useEffect(() => {
    async function fetchAppSettings() {
      const settings = await getAppSettings();
      setAppSettings(settings);
    }
    fetchAppSettings();
  }, []);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const mobileNavItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Produk", href: "/products", icon: Package },
    { name: "Chat", href: "/chats", icon: MessageSquare },
    { name: "Favorit", href: "/favorites", icon: Heart },
    { name: "Riwayat Pesanan", href: "/orders", icon: History },
    { name: "Metode Pembayaran", href: "/payment-methods", icon: CreditCard },
    { name: "Alamat Pengiriman", href: "/shipping-addresses", icon: MapPin },
    { name: "Notifikasi", href: "/notifications", icon: Bell },
    { name: "Pengaturan Akun", href: "/profile", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      {/* Top Header Bar - Hanya ditampilkan pada tampilan non-mobile */}
      {!isMobile && appSettings?.scrolling_text_enabled && appSettings?.scrolling_text_content && (
        <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
          <div className="container mx-auto px-4 py-1 flex justify-between items-center">
            <div className="flex space-x-4">
              {appSettings?.download_app_url && (
                <a href={appSettings.download_app_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  {appSettings.download_app_text || "Download Aplikasi"}
                </a>
              )}
            </div>
            {appSettings?.right_header_text_enabled && appSettings?.right_header_text_content && (
              <Link href={appSettings.right_header_text_link || "#"} className="hover:underline">
                {appSettings.right_header_text_content}
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    {appSettings?.site_logo_url ? (
                      <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
                    ) : (
                      <span className="text-lg font-bold">{appSettings?.site_name || "E-commerce"}</span>
                    )}
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="flex-1 overflow-y-auto">
                  <ul className="space-y-2">
                    {mobileNavItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-base font-medium">{item.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-auto border-t pt-4">
                  {user ? (
                    <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                      <LogOut className="h-5 w-5 mr-3" />
                      Keluar
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => { router.push("/auth"); setIsMobileMenuOpen(false); }}>
                      Masuk / Daftar
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {appSettings?.site_logo_url ? (
            <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
          ) : (
            <span className="text-lg font-bold">{appSettings?.site_name || "E-commerce"}</span>
          )}
        </Link>

        {/* Search Bar (Desktop Only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 rounded-full h-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Right-side Icons */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push("/cart")}>
            <ShoppingCart className="h-6 w-6" />
            {totalCartItems > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center text-xs">
                {totalCartItems}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile?.first_name ? profile.first_name[0].toUpperCase() : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.first_name || "Pengguna"} {profile?.last_name || ""}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan Akun
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/orders")}>
                  <History className="mr-2 h-4 w-4" />
                  Riwayat Pesanan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => router.push("/auth")}>
              <User className="h-6 w-6" />
              <span className="sr-only">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}