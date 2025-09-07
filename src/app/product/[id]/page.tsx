"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { mockProducts, flashSaleProducts } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, Truck, Store } from "lucide-react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/mock-data";

// Helper function to find a product in any of our mock data arrays
function getProductById(id: number): Product | undefined {
  const allProducts = [...mockProducts, ...flashSaleProducts];
  // Remove duplicates in case a product is in both lists
  const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());
  return uniqueProducts.find((p) => p.id === id);
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const { addItem } = useCart();
  const productId = parseInt(id, 10);
  
  // React needs to know this component is stateful from the start
  if (isNaN(productId)) {
      notFound();
  }
  
  const product = getProductById(productId);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addItem(product);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden border">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{product.rating}</span>
              <span className="mx-2">|</span>
              <span>Terjual {product.soldCount}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {formatRupiah(product.price)}
            </p>
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{discountPercentage}%</Badge>
                <span className="text-base text-muted-foreground line-through">
                  {formatRupiah(product.originalPrice)}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>Tambah ke Keranjang</Button>
            <Button size="lg" variant="outline" className="flex-1">Beli Langsung</Button>
          </div>

          <div className="border-t pt-6 space-y-4">
             <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Dijual oleh <a href="#" className="font-semibold text-blue-600">Official Store</a></span>
             </div>
             <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Dikirim dari <span className="font-semibold">{product.location}</span></span>
             </div>
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">100% Original & Garansi Resmi</span>
             </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Deskripsi Produk</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>Detail produk untuk "{product.name}" akan ditampilkan di sini. Saat ini, kami menggunakan deskripsi placeholder. Dalam aplikasi nyata, bagian ini akan berisi informasi rinci tentang spesifikasi, fitur, dan manfaat produk untuk membantu pelanggan membuat keputusan pembelian yang tepat.</p>
        </div>
      </div>
    </div>
  );
}