"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/lib/supabase/products"; // Import Product interface dari modul yang benar
import { ChatWidget } from "./chat-widget";
import Link from "next/link";

interface StickyProductActionsProps {
  product: Product;
  onAddToCart: () => void;
}

export function StickyProductActions({ product, onAddToCart }: StickyProductActionsProps) {
  const handleBuyNow = () => {
    // For "Beli Sekarang", we can add to cart and then redirect to checkout
    onAddToCart(); // Add to cart first
    // Then navigate to checkout. This is a simplified flow.
    // In a real app, you might want a direct buy flow that bypasses the cart.
    window.location.href = "/checkout"; 
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-40">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <ChatWidget productId={product.id} productName={product.name} />
        <Button variant="outline" size="lg" className="flex-1 h-12 text-base" onClick={handleBuyNow}>
          Beli Sekarang
        </Button>
        <Button size="lg" className="flex-1 h-12 text-base" onClick={onAddToCart}>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Tambah ke Keranjang
        </Button>
      </div>
    </div>
  );
}