"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, ShoppingCart, User, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/context/session-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CategoryDropdown } from "./category-dropdown"; // Import the new component
import { useRouter } from "next/navigation"; // Correct import for App Router

export function Header() {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter(); // Corrected: Call useRouter directly

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout. Silakan coba lagi.");
      console.error("Logout error:", error);
    } else {
      toast.success("Anda telah berhasil logout.");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left section: Logo and Category Dropdown */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-xl">
            <img src="/logo.svg" alt="Cellkom Store Logo" className="h-8 w-auto" />
            <span className="sr-only">Cellkom Store</span>
          </Link>
          <CategoryDropdown /> {/* Use the new CategoryDropdown component here */}
        </div>

        {/* Middle section: Search Bar (hidden on small screens) */}
        <div className="flex-1 mx-4 hidden md:block max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Cari produk..."
              className="w-full pl-9 pr-3 py-2 rounded-md border focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        {/* Right section: Icons and User Menu */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Keranjang</span>
            {/* <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              3
            </span> */}
          </Button>

          {isSessionLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.id}`} alt={profile?.first_name || "User"} />
                    <AvatarFallback>{profile?.first_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.first_name || "Pengguna"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-orders">Pesanan Saya</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/auth">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>
          )}

          {/* Mobile Menu (Hamburger Icon) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <img src="/logo.svg" alt="Cellkom Store Logo" className="h-8 w-auto" />
                  <span className="sr-only">Cellkom Store</span>
                </Link>
                <Link href="/categories" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary">
                  <LayoutGrid className="h-5 w-5" />
                  <span>Kategori</span>
                </Link>
                <Link href="/products" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary">
                  <span>Produk</span>
                </Link>
                {/* Add more mobile navigation links here */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}