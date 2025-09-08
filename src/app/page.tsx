import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductGrid } from "@/components/product-grid";
import { FeatureBadges } from "@/components/feature-badges"; // Import the new component
import { FeaturedBrands } from "@/components/featured-brands";
import { getFlashSaleProducts, getProducts, getProductsByCategory } from "@/lib/supabase-queries"; // Import fungsi Supabase

export default async function Home() {
  const products = await getProducts();
  const flashSaleProducts = await getFlashSaleProducts();
  const gadgetProducts = await getProductsByCategory("handphone-tablet");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <HeroCarousel />
      <FeatureBadges />
      <CategoryIcons />
      <FlashSale initialProducts={flashSaleProducts} />
      <FeaturedBrands />
      {gadgetProducts.length > 0 && (
        <ProductGrid 
          initialProducts={gadgetProducts} 
          title="Handphone & Tablet Populer" 
        />
      )}
      <ProductGrid initialProducts={products} />
    </div>
  );
}