"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategorySheet } from "./category-sheet"; // Import CategorySheet

export function MainNav() {
  return (
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
      <CategorySheet /> {/* Menggunakan CategorySheet di sini */}
      <Link
        href="/flash-sale"
        className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
      >
        Flash Sale
      </Link>
      <Link
        href="/new-arrivals"
        className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
      >
        Produk Baru
      </Link>
      <Link
        href="/best-sellers"
        className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
      >
        Terlaris
      </Link>
    </nav>
  );
}