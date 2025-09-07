"use client";

import { Menu, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartSheet } from "./cart-sheet";
import { useSearch } from "@/context/search-context";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { useSession } from "@/context/session-context"; // Import useSession
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { session, user, signOut, isLoading } = useSession(); // Use session context

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      {/* Top bar */}
      <div className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
        <div className="container mx-auto px-4 py-1 flex justify-end space-x-4">
          <a href="#" className="hover:underline">Jual di Blibli</a>
          <a href="#" className="hover:underline">Blibli Ticket Rewards</a>
          <a href="#" className="hover:underline">Cek daftar pesanan</a>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              blibli
            </Link>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-blue-600">
              <Menu className="h-5 w-5" />
              <span>Kategori</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden sm:block">
            <div className="relative">
              <Input
                type="search"
                placeholder="Cari produk impianmu..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
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
          </div>
        </div>
        <div className="mt-2 sm:hidden">
            <div className="relative">
              <Input
                type="search"
                placeholder="Cari produk di sini..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
        </div>
      </div>
    </header>
  );
}