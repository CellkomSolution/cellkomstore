"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageSquare } from "lucide-react"; // Import MessageSquare
import { formatRupiah } from "@/lib/utils";
import { Product } from "@/lib/supabase/products";
import { ChatWidget } from "./chat-widget"; // Import ChatWidget
import Link from "next/link";

interface StickyProductActionsProps {
  product: Product;
  onAddToCart: () => void;
}

export function StickyProductActions({ product, onAddToCart }: StickyProductActionsProps) {
  const [isChatOpen, setIsChatOpen] = React.useState(false); // State untuk mengontrol ChatWidget

  const handleBuyNow = () => {
    onAddToCart();
    window.location.href = "/checkout"; 
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-40">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shrink-0" onClick={() => setIsChatOpen(true)}>
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Chat Penjual</span>
        </Button>
        <Button variant="outline" size="lg" className="flex-1 h-12 text-base" onClick={handleBuyNow}>
          Beli Sekarang
        </Button>
        <Button size="lg" className="flex-1 h-12 text-base" onClick={onAddToCart}>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Tambah ke Keranjang
        </Button>
      </div>
      {/* Render ChatWidget di sini, dikontrol oleh state isChatOpen */}
      <ChatWidget 
        productId={product.id} 
        productName={product.name} 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen} 
      />
    </div>
  );
}