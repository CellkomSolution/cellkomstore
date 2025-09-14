"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, User, Search, Heart, Home, Package, Info, Phone, Download } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { session, signOut } = useAuth();
  const { data: appSettings } = useAppSettings();
  const { cartItems } = useCart();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["searchResults", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url")
        .ilike("name", `%${debouncedSearchTerm}%`)
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!debouncedSearchTerm,
  });

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
    { name: "Blog", href: "/blog", icon: Info },
  ];

  const handleSearchSelect = (productId: string) => {
    router.push(`/products/${productId}`);
    setSearchTerm(""); // Clear search term after selection
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      {appSettings?.scrolling_text_enabled && appSettings?.scrolling_text_content && (
        <div className="bg-primary text-primary-foreground text-xs py-1 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee">
            {appSettings.scrolling_text_content}
          </div>
        </div>
      )}
      <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          {/* Logo untuk tampilan mobile, disembunyikan pada layar md ke atas */}
          <div className="md:hidden">
            {appSettings?.site_logo_url ? (
              <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-6 w-auto" />
            ) : (
              <span className="text-sm font-bold">{appSettings?.site_name || "DyadCommerce"}</span>
            )}
          </div>
          {/* Tautan asli, disembunyikan pada layar kecil, ditampilkan pada layar md ke atas */}
          <div className="hidden md:flex space-x-4">
            {appSettings?.download_app_url && (
              <a href={appSettings.download_app_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                <Download size={12} />
                {appSettings.download_app_text || "Download Aplikasi"}
              </a>
            )}
            <Link href="/help" className="hover:underline flex items-center gap-1">
              <Info size={12} />
              Bantuan
            </Link>
            <Link href="/contact" className="hover:underline flex items-center gap-1">
              <Phone size={12} />
              Hubungi
            </Link>
          </div>
          {appSettings?.right_header_text_enabled && appSettings?.right_header_text_content && (
            <div className="hidden md:flex items-center gap-1">
              {appSettings.right_header_text_link ? (
                <Link href={appSettings.right_header_text_link} className="hover:underline">
                  {appSettings.right_header_text_content}
                </Link>
              ) : (
                <span>{appSettings.right_header_text_content}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setIsSheetOpen(false)}>
                  {appSettings?.site_logo_url ? (
                    <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
                  ) : (
                    <span className="text-xl font-bold">{appSettings?.site_name || "DyadCommerce"}</span>
                  )}
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <div className="mt-4 border-t pt-4">
                  {!session ? (
                    <Link href="/login" className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                      <User className="h-5 w-5" />
                      Login
                    </Link>
                  ) : (
                    <>
                      <Link href="/profile" className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsSheetOpen(false)}>
                        <User className="h-5 w-5" />
                        Profile
                      </Link>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-medium text-muted-foreground hover:text-primary" onClick={() => { signOut(); setIsSheetOpen(false); }}>
                        <X className="h-5 w-5" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
            <Link href="/" className="hidden lg:flex items-center gap-2 text-lg font-semibold">
              {appSettings?.site_logo_url ? (
                <img src={appSettings.site_logo_url} alt={appSettings.site_name || "Logo"} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold">{appSettings?.site_name || "DyadCommerce"}</span>
              )}
            </Link>
          </Sheet>
          <div className="relative hidden md:block w-64">
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {debouncedSearchTerm && searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 z-10">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSearchSelect(product.id)}
                  >
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="w-8 h-8 object-cover rounded mr-2" />
                    )}
                    <span>{product.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-6 w-6" />
              <span className="sr-only">Cart</span>
            </Button>
            {cartItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                {cartItems.length}
              </Badge>
            )}
          </Link>
          {!session ? (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
                <span className="sr-only">Login</span>
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.user_metadata.avatar_url || "/placeholder-user.jpg"} alt="User Avatar" />
                    <AvatarFallback>{session.user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.user_metadata.first_name || session.user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;