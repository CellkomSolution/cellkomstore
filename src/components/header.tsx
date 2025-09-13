"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ShoppingCart, Phone, Menu } from "lucide-react"; // Mengganti MapPin dengan Phone
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAuthNav } from "./user-auth-nav";
import { ChatNotificationIcon } from "./admin-chat-notification-icon";
import { Dialog, DialogTrigger } from "@/components/ui/dialog"; // Import Dialog components
import { AdminContactInfo } from "./admin-contact-info"; // Import the new component

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="sr-only">E-commerce</span>
          </Link>
          <form className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk..."
              className="w-[300px] appearance-none bg-background pl-8 shadow-none"
            />
          </form>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Phone className="h-4 w-4" /> {/* Mengganti ikon */}
                <span>Hubungi</span> {/* Mengganti teks */}
                <Menu className="h-4 w-4 rotate-90" />
              </Button>
            </DialogTrigger>
            <AdminContactInfo /> {/* Menampilkan informasi kontak admin */}
          </Dialog>

          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              3
            </span>
            <span className="sr-only">Keranjang</span>
          </Button>
          <ChatNotificationIcon />
          <UserAuthNav />
        </div>
      </div>
    </header>
  );
}