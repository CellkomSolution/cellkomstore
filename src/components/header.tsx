"use client";

import { Menu, Search, User, LogOut, LayoutGrid, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartSheet } from "./cart-sheet";
import { useSearch } from "@/context/search-context";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { useSession } from "@/context/session-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { session, user, signOut, isLoading } = useSession();

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      {/* Top bar */}
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

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              <Image 
                src="/teslogocellkom.png" 
                alt="Cellkom Store Logo" 
                width={120}
                height={30}
                className="h-auto"
              />
            </Link>
            <Button variant="ghost" className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
              <LayoutGrid className="h-5 w-5" />
              <span>Kategori</span>
            </Button>
          </div>

          <div className="flex-1 max-w-xl hidden sm:flex">
            <div className="relative flex w-full">
              <Input
                type="search"
                placeholder="Cari produk impianmu..."
                className="flex-1 rounded-r-none pr-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="rounded-l-none px-4">
                <Search className="h-5 w-5" />
                <span className="sr-only">Cari</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CartSheet />
            {!isLoading && (
              <>
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.email ? user.email[0].toUpperCase() : <User className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Akun</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Keluar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/auth">Masuk</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth">Daftar</Link>
                    </Button>
                  </div>
                )}
                <Button variant="ghost" size="icon" className="md:hidden" asChild>
                  <Link href="/auth">
                    <User className="h-6 w-6" />
                    <span className="sr-only">Akun</span>
                  </Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-2 sm:hidden">
            <div className="relative flex w-full">
              <Input
                type="search"
                placeholder="Cari produk di sini..."
                className="flex-1 rounded-r-none pr-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="rounded-l-none px-4">
                <Search className="h-5 w-5" />
                <span className="sr-only">Cari</span>
              </Button>
            </div>
        </div>
      </div>

      {/* New Bottom Bar for popular searches and location */}
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
            <Menu className="h-4 w-4 rotate-90" /> {/* Using Menu icon rotated for dropdown arrow */}
          </Button>
        </div>
      </div>
    </header>
  );
}