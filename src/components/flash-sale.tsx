"use client";

import { Zap, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";
import { CountdownTimer } from "./countdown-timer";
import { Product } from "@/lib/supabase/products"; // Import Product interface dari modul yang benar

interface FlashSaleProps {
  initialProducts: Product[];
}

export function FlashSale({ initialProducts }: FlashSaleProps) {
  // Set flash sale to end in 24 hours from now
  const saleEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return (
    <section className="bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Flash Sale
          </h2>
          <CountdownTimer targetDate={saleEndDate} />
        </div>
        <a href="#" className="text-sm font-semibold text-blue-600 hover:underline flex items-center">
          Lihat Semua <ChevronRight className="h-4 w-4" />
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {initialProducts.map((product) => (
          <div key={product.id} className="w-40 sm:w-48 flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}