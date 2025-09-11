"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, Truck, Store } from "lucide-react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/supabase/products"; // Import Product interface dari modul yang benar
import { getProductById } from "@/lib/supabase/products"; // Import getProductById dari modul yang benar
import { formatRupiah } from "@/lib/utils";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton";
import { StickyProductActions } from "@/components/sticky-product-actions";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { addItem } = useCart();
  
  const [product, setProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const fetchedProduct = await getProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      } else {
        notFound();
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return <ProductDetailPageSkeleton />;
  }

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    addItem(product);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square rounded-lg overflow-hidden border">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

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

          <div className="border-t pt-6 space-y-4">
             <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Dijual oleh <a href="#" className="font-semibold text-primary">Official Store</a></span>
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

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Deskripsi Produk</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>Detail produk untuk "{product.name}" akan ditampilkan di sini. Saat ini, kami menggunakan deskripsi placeholder. Dalam aplikasi nyata, bagian ini akan berisi informasi rinci tentang spesifikasi, fitur, dan manfaat produk untuk membantu pelanggan membuat keputusan pembelian yang tepat.</p>
        </div>
      </div>

      <StickyProductActions product={product} onAddToCart={handleAddToCart} />
    </div>
  );
}