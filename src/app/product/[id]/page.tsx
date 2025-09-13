"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, Truck, Store, ShoppingCart, MessageSquare } from "lucide-react"; // Import MessageSquare
import { useCart } from "@/context/cart-context";
import { Product, getProductById, getProductsByCategory } from "@/lib/supabase/products"; // Import getProductsByCategory
import { formatRupiah } from "@/lib/utils";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton";
import { StickyProductActions } from "@/components/sticky-product-actions";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { ProductGrid } from "@/components/product-grid"; // Import ProductGrid
import { useSession } from "@/context/session-context"; // Import useSession
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget"; // Import ChatWidget

interface ProductDetailPageProps {
  params: Promise<{ id: string }>; // Menyesuaikan tipe params menjadi Promise
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Menggunakan React.use() untuk meng-unwrap params
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

  const { addItem } = useCart();
  const isMobile = useIsMobile(); // Use the hook
  const { user } = useSession(); // Get user from session
  const router = useRouter();
  
  const [product, setProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [isLoadingRelatedProducts, setIsLoadingRelatedProducts] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false); // State untuk mengontrol ChatWidget

  React.useEffect(() => {
    async function fetchProductAndRelated() {
      setIsLoading(true);
      const fetchedProduct = await getProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        // Fetch related products
        setIsLoadingRelatedProducts(true);
        const fetchedRelatedProducts = await getProductsByCategory(fetchedProduct.category);
        setRelatedProducts(fetchedRelatedProducts.filter(p => p.id !== fetchedProduct.id)); // Filter out current product
        setIsLoadingRelatedProducts(false);
      } else {
        notFound();
      }
      setIsLoading(false);
    }
    fetchProductAndRelated();
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

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Anda harus login untuk melanjutkan pembelian.");
      router.push("/auth");
      return;
    }
    addItem(product);
    router.push("/checkout"); 
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

          {/* Desktop Buy Now / Add to Cart / Chat buttons */}
          {!isMobile && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-8">
              <Button variant="outline" size="lg" className="flex-1 h-12 text-base" onClick={handleBuyNow}>
                Beli Sekarang
              </Button>
              <Button size="lg" className="flex-1 h-12 text-base" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Tambah ke Keranjang
              </Button>
              <Button variant="outline" size="lg" className="flex-1 h-12 text-base" onClick={() => setIsChatOpen(true)}>
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat Penjual
              </Button>
            </div>
          )}

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

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <ProductGrid 
            products={relatedProducts} 
            title="Produk Lain di Kategori Ini" 
            isLoading={isLoadingRelatedProducts}
            emptyStateMessage="Tidak ada produk terkait."
          />
        </div>
      )}

      {/* Mobile Sticky Product Actions */}
      {isMobile && (
        <StickyProductActions product={product} onAddToCart={handleAddToCart} />
      )}
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