"use client";

import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
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
            <a href="/" className="text-2xl font-bold text-blue-600">
              blibli
            </a>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-blue-600">
              <Menu className="h-5 w-5" />
              <span>Kategori</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden sm:block">
            <div className="relative">
              <Input
                type="search"
                placeholder="xiaomi redmi note 14 pro 5 g"
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-6 w-6" />
              <span className="sr-only">Keranjang Belanja</span>
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline">Masuk</Button>
              <Button>Daftar</Button>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <User className="h-6 w-6" />
              <span className="sr-only">Akun</span>
            </Button>
          </div>
        </div>
        <div className="mt-2 sm:hidden">
            <div className="relative">
              <Input
                type="search"
                placeholder="Cari produk di sini..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
        </div>
      </div>
    </header>
  );
}