"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, Truck, Store, ShoppingCart, MessageSquare, Heart, Search, Eye, Copy } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Product, getProductById, getProductsByCategory } from "@/lib/supabase/products";
import { formatRupiah } from "@/lib/utils";
import { ProductDetailPageSkeleton } from "@/components/product-detail-page-skeleton";
import { StickyProductActions } from "@/components/sticky-product-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductGrid } from "@/components/product-grid";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";
import Image from "next/image";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea"; // Using existing Textarea
import { ParticleButton } from "@/components/particle-button"; // New ParticleButton

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = React.use(params);

  const { addItem } = useCart();
  const isMobile = useIsMobile();
  const { user } = useSession();
  const router = useRouter();
  
  const [product, setProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [isLoadingRelatedProducts, setIsLoadingRelatedProducts] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false); // Local state for wishlist
  const [feedback, setFeedback] = React.useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function fetchProductAndRelated() {
      setIsLoading(true);
      const fetchedProduct = await getProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setIsLoadingRelatedProducts(true);
        const fetchedRelatedProducts = await getProductsByCategory(fetchedProduct.category);
        setRelatedProducts(fetchedRelatedProducts.filter(p => p.id !== fetchedProduct.id));
        setIsLoadingRelatedProducts(false);
      } else {
        notFound();
      }
      setIsLoading(false);
    }
    fetchProductAndRelated();
  }, [id]);

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const images = product?.images.length > 0 ? product.images.map(img => img.image_url) : (product?.imageUrl ? [product.imageUrl] : []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Umpan balik tidak boleh kosong.");
      return;
    }
    setIsSubmittingFeedback(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Umpan balik Anda telah terkirim!");
    setFeedbackSubmitted(true);
    setFeedback("");
    setIsSubmittingFeedback(false);
    setTimeout(() => setFeedbackSubmitted(false), 2000); // Reset success state
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Carousel */}
        <div>
          <div className="relative aspect-square rounded-lg overflow-hidden border">
            {images.length > 0 ? (
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${product.name} - View ${currentImageIndex + 1}`}
                fill
                style={{ objectFit: "cover" }}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-lg">
                No Image
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-primary w-4" : "bg-primary/30"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
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

          {!isMobile && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-8">
              <Button variant="outline" size="lg" className="flex-1 h-12 text-base" onClick={handleBuyNow}>
                Beli Sekarang
              </Button>
              <Button size="lg" className="flex-1 h-12 text-base" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Tambah ke Keranjang
              </Button>
              <Button 
                variant="outline" 
                className="
                  h-12 px-8 text-base flex-1
                  md:h-10 md:w-10 md:p-0 md:flex-none
                  lg:h-12 lg:px-8 lg:text-base lg:flex-1 lg:w-auto
                " 
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquare className="h-5 w-5 md:mr-0 lg:mr-2" />
                <span className="md:sr-only lg:not-sr-only">Chat Penjual</span>
              </Button>
            </div>
          )}

          <div className="border-t pt-6 space-y-4">
             <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Dijual oleh <a href="#" className="font-semibold text-primary">Cellkom Store</a></span>
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

      {/* Feedback Section */}
      <div className="mt-12 bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Bagikan Umpan Balik Anda
        </h3>
        <Textarea
          placeholder="Beritahu kami pendapat Anda tentang produk ini..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mb-4"
        />
        <ParticleButton 
          className="w-full"
          onClick={handleFeedbackSubmit}
          disabled={!feedback.trim()}
          isLoading={isSubmittingFeedback}
          isSuccess={feedbackSubmitted}
        >
          Kirim Umpan Balik
        </ParticleButton>
      </div>

      {/* Product Features */}
      <div className="mt-6 bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Fitur Produk Unggulan
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Bahan premium dan konstruksi berkualitas tinggi</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Tersedia dalam berbagai pilihan warna dan ukuran</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Gratis ongkir untuk semua pesanan</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Garansi pengembalian 30 hari</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" onClick={() => setIsWishlisted(!isWishlisted)}>
            <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
            Wishlist
          </Button>
          <Button variant="outline" className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Bandingkan
          </Button>
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            Pratinjau
          </Button>
          <Button variant="outline" className="w-full" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.info("Tautan produk disalin!");
          }}>
            <Copy className="h-4 w-4 mr-2" />
            Bagikan
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Deskripsi Produk</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
            {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
                <p>Tidak ada deskripsi yang tersedia untuk produk ini.</p>
            )}
        </div>
      </div>

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

      {isMobile && (
        <StickyProductActions product={product} onAddToCart={handleAddToCart} />
      )}
      <ChatWidget 
        productId={product.id} 
        productName={product.name} 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen} 
      />
    </div>
  );
}