"use client";

import * as React from "react";
import { Product } from "@/lib/supabase/products";
import { ProductGrid } from "@/components/product-grid";
import { UsedProductsCarousel } from "@/components/used-products-carousel";

interface HomeProductShowcaseProps {
  products: Product[];
  title: string;
}

export function HomeProductShowcase({ products, title }: HomeProductShowcaseProps) {
  return (
    <section className="space-y-8">
      <UsedProductsCarousel />
      <ProductGrid products={products} title={title} />
    </section>
  );
}