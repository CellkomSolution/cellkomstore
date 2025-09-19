import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { ProductGrid } from "@/components/product-grid";
import { FeaturedBrands } from "@/components/featured-brands";
import { ProductCarouselSection } from "@/components/product-carousel-section";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { UsedProductsCarousel } from "@/components/used-products-carousel";
import { HomeProductShowcase } from "@/components/home-product-showcase"; // Import new component
import { getFlashSaleProducts, getProducts, getProductsByCategory } from "@/lib/supabase/products";

export default async function Home() {
  const products = await getProducts();
  const flashSaleProducts = await getFlashSaleProducts();
  const gadgetProducts = await getProductsByCategory("handphone-tablet");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <HeroBannerCarousel />
      <CategoryIcons />
      <ProductCarouselSection />
      <FlashSale initialProducts={flashSaleProducts} />
      {gadgetProducts.length > 0 && (
        <ProductGrid 
          products={gadgetProducts} 
          title="Handphone & Tablet Populer" 
        />
      )}
      <FeaturedBrands />
      <HomeProductShowcase products={products} title="Produk Pilihan Untukmu" /> {/* Use the new component here */}
    </div>
  );
}