import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductGrid } from "@/components/product-grid";
import { FeatureBadges } from "@/components/feature-badges"; // Import the new component
import { getFlashSaleProducts, getProducts } from "@/lib/supabase-queries"; // Import fungsi Supabase

export default async function Home() {
  const products = await getProducts();
  const flashSaleProducts = await getFlashSaleProducts();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <HeroCarousel />
      <FeatureBadges /> {/* Add the new component here */}
      <CategoryIcons />
      <FlashSale initialProducts={flashSaleProducts} />
      <ProductGrid initialProducts={products} />
    </div>
  );
}