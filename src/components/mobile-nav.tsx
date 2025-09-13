"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Home, Tag, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CategorySheet } from "./category-sheet"; // Import CategorySheet

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Navigasi</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 py-4">
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Beranda
            </Link>
          </Button>
          <CategorySheet /> {/* Menggunakan CategorySheet di sini */}
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/flash-sale">
              <Sparkles className="mr-2 h-4 w-4" />
              Flash Sale
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/new-arrivals">
              <Tag className="mr-2 h-4 w-4" />
              Produk Baru
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/best-sellers">
              <TrendingUp className="mr-2 h-4 w-4" />
              Terlaris
            </Link>
          </Button>
          <Separator />
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/profile">
              <Home className="mr-2 h-4 w-4" />
              Profil
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
            <Link href="/my-orders">
              <Home className="mr-2 h-4 w-4" />
              Pesanan Saya
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}