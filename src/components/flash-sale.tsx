"use client";

import { Zap, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card"; // Keep ProductCard import if needed elsewhere, but we'll use ProductGradientCard here
import { CountdownTimer } from "./countdown-timer";
import { Product } from "@/lib/supabase/products";
import { useState, useEffect } from "react";
import { ProductGradientCard } from "./product-gradient-card"; // Import ProductGradientCard

interface FlashSaleProps {
  initialProducts: Product[];
}

export function FlashSale({ initialProducts }: FlashSaleProps) {
  const [saleEndDate, setSaleEndDate] = useState<string | null>(null);

  useEffect(() => {
    // Set flash sale to end in 24 hours from now, only on the client
    const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setSaleEndDate(endDate);
  }, []);

  return (
    <section className="bg-gray-900 p-4 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Flash Sale
          </h2>
          <CountdownTimer targetDate={saleEndDate} />
        </div>
        <a href="#" className="text-sm font-semibold text-blue-400 hover:underline flex items-center">
          Lihat Semua <ChevronRight className="h-4 w-4" />
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {initialProducts.map((product) => (
          <div key={product.id} className="w-48 flex-shrink-0"> {/* Adjusted width for better fit */}
            <ProductGradientCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}