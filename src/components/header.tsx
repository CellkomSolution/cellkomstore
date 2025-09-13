"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Search, User, Heart, Home, Info, Newspaper, Phone, Mail, Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getAppSettings, AppSettings } from "@/lib/supabase/app-settings";
import { getCategories, Category } from "@/lib/supabase/categories";

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Tentang Kami", href: "/about", icon: Info },
  { name: "Blog", href: "/blog", icon: Newspaper }, // New Blog link
  { name: "Kontak", href: "/contact", icon: Phone },
];

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchSettingsAndCategories = async () => {
      const settings = await getAppSettings();
      setAppSettings(settings);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    };
    fetchSettingsAndCategories();
  }, []);

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="flex space-x-4">
            {appSettings?.scrolling_text_enabled && appSettings?.scrolling_text_content && (
              <div className="overflow-hidden whitespace-nowrap">
                <span className="inline-block animate-marquee">
                  {appSettings.scrolling_text_content}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {appSettings?.right_header_text_enabled && appSettings?.right_header_text_content && (
              <Link href={appSettings.right_header_text_link || "#"} className="hover:underline">
                {appSettings.right_header_text_content}
              </Link>
            )}
            {appSettings?.contact_phone && (
              <a href={`tel:${appSettings.contact_phone}`} className="hover:underline flex items-center gap-1">
                <Phone className="h-3 w-3" /> {appSettings.contact_phone}
              </a>
            )}
            {appSettings?.contact_email && (
              <a href={`mailto:${appSettings.contact_email}`} className="hover:underline flex items-center gap-1">
                <Mail className="h-3 w-3" /> {appSettings.contact_email}
              </a>
            )}
            {appSettings?.facebook_url && (
              <a href={appSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Facebook className="h-3 w-3" />
              </a>
            )}
            {appSettings?.instagram_url && (
              <a href={appSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Instagram className="h-3 w-3" />
              </a>
            )}
            {appSettings?.twitter_url && (
              <a href={appSettings.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Twitter className="h-3 w-3" />
              </a>
            )}
            {appSettings?.youtube_url && (
              <a href={appSettings.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Youtube className="h-3 w-3" />
              </a>
            )}
            {appSettings?.linkedin_url && (
              <a href={appSettings.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Linkedin className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-x-8">
          <Link href="/" className="flex items-center gap-x-2">
            {appSettings?.site_logo_url ? (
              <img src={appSettings.site_logo_url} alt="Logo" className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold">{appSettings?.site_name || "Cellkom"}</span>
            )}
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="relative group">
              <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                Kategori
              </Button>
              <div className="absolute left-0 top-full mt-2 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari produk..." className="pl-8 w-[200px]" />
          </div>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center">0</Badge>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center">0</Badge>
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" onClick={signOut}>
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-y-4 pt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="relative">
                  <h3 className="text-lg font-medium mb-2">Kategori</h3>
                  <div className="flex flex-col gap-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="block text-base text-foreground hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="relative mt-4 md:hidden">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari produk..." className="pl-8 w-full" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}