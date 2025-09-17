import { CategoryIcons } from "@/components/category-icons";
import { FlashSale } from "@/components/flash-sale";
import { ProductGrid } from "@/components/product-grid";
import { LogoCarouselSection } from "@/components/logo-carousel-section"; // Import the new component
import { FeaturedBrands } from "@/components/featured-brands";
import { getFlashSaleProducts, getProducts, getProductsByCategory } from "@/lib/supabase/products"; // Import dari modul products

export default async function Home() {
  const products = await getProducts();
  const flashSaleProducts = await getFlashSaleProducts();
  const gadgetProducts = await getProductsByCategory("handphone-tablet");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* HeroCarousel removed */}
      {/* <FeatureBadges /> Removed FeatureBadges */}
      <LogoCarouselSection /> {/* Added the new LogoCarouselSection */}
      <CategoryIcons />
      <FlashSale initialProducts={flashSaleProducts} />
      <FeaturedBrands />
      {gadgetProducts.length > 0 && (
        <ProductGrid 
          products={gadgetProducts} 
          title="Handphone & Tablet Populer" 
        />
      )}
      <ProductGrid products={products} title="Produk Pilihan Untukmu" />
    </div>
  );
}